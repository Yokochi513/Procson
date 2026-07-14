import type { NextRequest } from "next/server";
import { interviewCategories } from "@/lib/interview/interviewFlow";

// リクエストごとに実行（キャッシュしない）
export const dynamic = "force-dynamic";

type ChatTurn = { role: "user" | "assistant"; content: string };

/**
 * .env は `api_key=sk-ant-...` で保存されているため、
 * SDK 既定の ANTHROPIC_API_KEY だけでなく api_key も参照する。
 */
function getApiKey(): string | undefined {
  return process.env.ANTHROPIC_API_KEY ?? process.env.api_key;
}

const CATEGORY_LIST = interviewCategories.join(" → ");

/** 面接官AIの共通ルール（システムプロンプト） */
const INTERVIEWER_SYSTEM = `あなたは新卒採用の面接官です。就職活動中の学生に、実際の採用面接に近い練習の場を提供します。

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

【出力形式】
必ず次のJSONのみを出力してください。前後に説明文やコードブロックは付けないでください。
{
  "reply": "面接官としての発言（上記ルールに従う）",
  "category": "今その発言で尋ねている質問のカテゴリ。次のいずれか、または挨拶のみ・雑談なら空文字。[${interviewCategories.join(", ")}]",
  "finished": 逆質問まで終えて面接を締めくくったら true、それ以外は false
}`;

/** 評価用システムプロンプト */
const EVALUATION_SYSTEM = `あなたは面接の評価者です。これまでの面接のやり取り全体を読み、学生を100点満点で評価します。
優しく、しかし公平に評価し、具体的で前向きな改善アドバイスを添えてください。

【出力形式】
必ず次のJSONのみを出力してください。前後に説明文やコードブロックは付けないでください。
{
  "logical": 論理性(0-100の整数),
  "specific": 具体性(0-100の整数),
  "passion": 熱意(0-100の整数),
  "communication": コミュニケーション力(0-100の整数),
  "total": 総合評価(0-100の整数),
  "summary": "全体の総評（2〜3文）",
  "improvements": ["具体的な改善点1", "具体的な改善点2", "具体的な改善点3"]
}`;

/** モデル出力から JSON を安全に取り出す */
function extractJson(text: string): any {
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
  };
  const mode = body.mode ?? "chat";
  const history = body.history ?? [];

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
        max_tokens: 1024,
        system: EVALUATION_SYSTEM,
        messages: [
          {
            role: "user",
            content: `以下は面接のやり取りです。この学生を評価してください。\n\n${transcript}`,
          },
        ],
      });

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

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 600,
      system: INTERVIEWER_SYSTEM,
      messages,
    });

    const text = response.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("");
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
