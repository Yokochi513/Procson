import type { NextRequest } from "next/server";
import { interviewCategories } from "@/lib/interview/interviewFlow";
import { entrySheetFields } from "@/lib/entrySheet/fields";
import type { EntrySheetAnswers } from "@/lib/entrySheet/types";
import { getApiKey } from "@/lib/ai/apiKey";

// リクエストごとに実行（キャッシュしない）
export const dynamic = "force-dynamic";

type ChatTurn = { role: "user" | "assistant"; content: string };

/** 面接の対象企業情報（CSVの1行ぶん。無い場合は一般面接） */
interface CompanyContext {
  company: string;
  industry?: string;
  strength?: string;
}

const CATEGORY_LIST = interviewCategories.join(" → ");

/** 企業・ESの文脈をシステムプロンプトに差し込む文字列を作る */
function buildContext(
  company?: CompanyContext | null,
  esAnswers?: EntrySheetAnswers | null
): string {
  const parts: string[] = [];

  if (company?.company) {
    parts.push(
      `【面接を行う企業】
あなたは「${company.company}」（業界：${company.industry ?? "不明"}）の面接官です。
この企業の特徴・強み：${company.strength ?? "（情報なし）"}

志望動機・入社後に挑戦したいことなどの質問では、必ずこの企業を前提にしてください（例：「なぜ当社を志望されたのですか」）。
学生の回答がこの企業や業界の特徴と結びついているかに注目して、深掘りしてください。
ただし、あなたが知らない社内制度などを断定的に語らないでください。`
    );
  } else {
    parts.push(
      `【面接を行う企業】
特定の企業を指定しない、一般的な新卒採用面接として進めてください。
志望動機の質問では「志望されている企業について」という形で尋ねてください。`
    );
  }

  if (esAnswers) {
    const es = entrySheetFields
      .map((f) => {
        const v = (esAnswers[f.id] ?? "").trim();
        return v ? `【${f.label}】\n${v}` : null;
      })
      .filter(Boolean)
      .join("\n\n");

    if (es) {
      parts.push(
        `【学生が提出したエントリーシート】
以下はこの学生が事前に提出したESです。内容を踏まえ、書かれている内容の深掘り（具体的なエピソード・数字・その時の判断など）を中心に質問してください。
ESに書いてあることをそのまま聞き直すのではなく、「ESに〇〇とありますが、その時…」のように一歩踏み込んで尋ねてください。

${es}`
      );
    }
  }

  return parts.join("\n\n");
}

/** 面接官AIの共通ルール（システムプロンプト） */
function buildInterviewerSystem(
  company?: CompanyContext | null,
  esAnswers?: EntrySheetAnswers | null
): string {
  return `あなたは新卒採用の面接官です。就職活動中の学生に、実際の採用面接に近い練習の場を提供します。

${buildContext(company, esAnswers)}

【役割】
・あなたは面接官であり、学生を評価する立場です。
・優しく丁寧な口調で、しかし本番さながらの緊張感を保って話してください。
・最後まで面接官の役割を崩さないでください。

【面接の流れ】この順番で進めます。
挨拶 → ${CATEGORY_LIST} → 面接終了

【質問方法】
・一度に質問は必ず1つだけにしてください。
・学生の回答を見て、自然に次の質問へ進んでください。
・必要であれば、同じテーマで1〜2回だけ深掘り質問をしてください。深掘りしすぎないでください。

【回答への対応】学生の回答を受けたら、次の順番で短く返します。
①簡単な相づち（例：「なるほど」「ありがとうございます」）
②良い点を一言
③必要であれば深掘り質問を1つ（任意）
④次の質問（深掘りしない場合）

【禁止事項】
・一度に複数の質問をしない。
・説教をしない。
・長文になりすぎない（1回の発言は3〜4文程度）。
・回答例・模範解答を書かない。
・面接官の役割を崩さない。

【最初の発言】
まだ会話が始まっていない場合は、入室の挨拶をしてから最初の質問（自己紹介）をしてください。

【出力する各項目について】
・reply … 面接官としての発言（上記ルールに従う。3〜4文程度）
・category … 今その発言で尋ねている質問のカテゴリ。挨拶のみ・雑談の場合は空文字。
・finished … 逆質問まで終えて面接を締めくくったら true、それ以外は false`;
}

/** chat モードの構造化出力スキーマ（JSONの形式をAPI側で保証させる） */
const CHAT_SCHEMA = {
  type: "object",
  properties: {
    reply: {
      type: "string",
      description: "面接官としての発言",
    },
    category: {
      type: "string",
      description: "今尋ねている質問のカテゴリ。挨拶のみ・雑談なら空文字。",
      enum: [...interviewCategories, ""],
    },
    finished: {
      type: "boolean",
      description: "面接を締めくくったら true",
    },
  },
  required: ["reply", "category", "finished"],
  additionalProperties: false,
} as const;

/** 評価用システムプロンプト */
function buildEvaluationSystem(company?: CompanyContext | null): string {
  const target = company?.company
    ? `この面接は「${company.company}」（${company.industry ?? ""}）の選考です。志望動機や入社後の展望が、この企業の特徴と結びついているかも評価に含めてください。`
    : "この面接は特定企業を指定しない一般的な新卒面接です。";

  return `あなたは面接の評価者です。これまでの面接のやり取り全体を読み、学生を100点満点で評価します。
優しく、しかし公平に評価し、具体的で前向きな改善アドバイスを添えてください。
${target}

【出力する各項目について】
・logical / specific / passion / communication / total … それぞれ0〜100の整数
・summary … 全体の総評（2〜3文）
・improvements … 具体的な改善点を3つ`;
}

/** evaluate モードの構造化出力スキーマ */
const EVALUATION_SCHEMA = {
  type: "object",
  properties: {
    logical: { type: "integer", description: "論理性 0〜100" },
    specific: { type: "integer", description: "具体性 0〜100" },
    passion: { type: "integer", description: "熱意 0〜100" },
    communication: { type: "integer", description: "コミュニケーション力 0〜100" },
    total: { type: "integer", description: "総合評価 0〜100" },
    summary: { type: "string", description: "全体の総評（2〜3文）" },
    improvements: {
      type: "array",
      description: "具体的な改善点",
      items: { type: "string" },
    },
  },
  required: [
    "logical",
    "specific",
    "passion",
    "communication",
    "total",
    "summary",
    "improvements",
  ],
  additionalProperties: false,
} as const;

/**
 * モデル出力から JSON を取り出す。
 * output_config.format（構造化出力）で形式は保証されるが、
 * 念のためコードブロック等が混じっても拾えるようにしておく。
 */
function extractJson(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  // ```json ... ``` を剥がす
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("JSON not found");
  return JSON.parse(candidate.slice(start, end + 1));
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    mode?: "chat" | "evaluate";
    history?: ChatTurn[];
    company?: CompanyContext | null;
    esAnswers?: EntrySheetAnswers | null;
  };
  const mode = body.mode ?? "chat";
  const history = body.history ?? [];
  const company = body.company ?? null;
  const esAnswers = body.esAnswers ?? null;

  const apiKey = getApiKey();
  if (!apiKey) {
    return Response.json(
      { error: "APIキーが設定されていません（.env の api_key を確認してください）。" },
      { status: 500 }
    );
  }

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    if (mode === "evaluate") {
      const transcript = history
        .map((t) => `${t.role === "assistant" ? "面接官" : "学生"}: ${t.content}`)
        .join("\n");

      const response = await client.messages.create({
        model: "claude-opus-4-8",
        // 調査の結果、実使用トークンは上限を大きく下回っていたが、
        // summary/improvements が長くなるケースに備えて余裕を持たせる。
        // （料金は実際に使用したトークン分のみで、上限を上げても増額にはならない）
        max_tokens: 4096,
        system: buildEvaluationSystem(company),
        output_config: {
          format: { type: "json_schema", schema: EVALUATION_SCHEMA },
        },
        messages: [
          {
            role: "user",
            content: `以下は面接のやり取りです。この学生を評価してください。\n\n${transcript}`,
          },
        ],
      });

      if (response.stop_reason === "max_tokens") {
        console.error("Evaluation truncated by max_tokens");
        return Response.json(
          { error: "評価の生成が途中で終了しました。もう一度お試しください。" },
          { status: 500 }
        );
      }

      const text = response.content
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("");
      const evalResult = extractJson(text);
      return Response.json({ evaluation: evalResult });
    }

    // --- chat モード ---
    // 履歴の先頭は面接官(assistant)の発言になり得るが、Messages API は
    // 最初を user にする必要があるため、常に kickoff の user メッセージを先頭に付ける。
    const messages = [
      {
        role: "user" as const,
        content: "（面接を始めてください。これまでの会話に続けて進行してください。）",
      },
      ...history.map((t) => ({ role: t.role, content: t.content })),
    ];

    // === 調査ログ①：システムプロンプト・履歴のサイズ（⑥の切り分け用） ===
    const systemPrompt = buildInterviewerSystem(company, esAnswers);
    console.log(
      `[interview][debug] system prompt length=${systemPrompt.length} chars, ` +
        `messages count=${messages.length}, ` +
        `total message chars=${messages.reduce((n, m) => n + m.content.length, 0)}`
    );

    const requestStartedAt = Date.now();
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      // 調査により、通常時の使用量は 2048 に対し実測 109 トークン程度と判明したが、
      // ES・企業情報が長く面接官の返答が想定より長文化した場合に max_tokens で
      // 途中切断（JSON破損）しないよう、余裕を持たせて 4096 に引き上げる。
      // （料金は実際に使用したトークン分のみで、上限を上げても増額にはならない）
      max_tokens: 4096,
      system: systemPrompt,
      output_config: {
        format: { type: "json_schema", schema: CHAT_SCHEMA },
      },
      messages,
    });
    const elapsedMs = Date.now() - requestStartedAt;

    // === 調査ログ②：レスポンスの生データを丸ごと出力 ===
    // stop_reason / usage / content をそのまま確認できるようにする。
    console.log(
      `[interview][debug] Claude API call took ${elapsedMs}ms, ` +
        `stop_reason=${response.stop_reason}, ` +
        `usage=${JSON.stringify(response.usage)}`
    );
    console.log(
      "[interview][debug] raw response.content=",
      JSON.stringify(response.content, null, 2)
    );

    if (response.stop_reason === "max_tokens") {
      console.error("Interviewer reply truncated by max_tokens");
      return Response.json(
        { error: "面接官の応答が途中で終了しました。もう一度お試しください。" },
        { status: 500 }
      );
    }

    const text = response.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("");

    // === 調査ログ③：連結後のテキスト（パース対象そのもの） ===
    console.log(
      `[interview][debug] joined text length=${text.length}, content=`,
      JSON.stringify(text)
    );

    const parsed = extractJson(text);

    return Response.json({
      reply: String(parsed.reply ?? "").trim(),
      category: String(parsed.category ?? "").trim(),
      finished: Boolean(parsed.finished),
    });
  } catch (error) {
    console.error("Interview API error:", error);
    return Response.json(
      { error: "面接AIの呼び出しに失敗しました。時間をおいて再度お試しください。" },
      { status: 500 }
    );
  }
}
