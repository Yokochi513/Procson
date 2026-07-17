import type { NextRequest } from "next/server";
import { getApiKey } from "@/lib/ai/apiKey";

// リクエストごとに実行（キャッシュしない）
export const dynamic = "force-dynamic";

type WizardVariant = "gakuchika" | "strength" | "weakness";

const QUESTION_LABELS: Record<WizardVariant, string[]> = {
  gakuchika: [
    "学生時代に力を入れたこと（一言で）",
    "そこで学んだこと（一言で）",
    "直面した課題",
    "課題をどう乗り越えたか",
    "今後どう活かしていきたいか",
  ],
  strength: [
    "長所（一言で）",
    "その長所が発揮された場面（一言で）",
    "そのとき直面した課題",
    "課題をどう乗り越えたか（工夫）",
    "今後その長所をどう活かしていきたいか",
  ],
  weakness: [
    "短所（一言で）",
    "その短所が表れた場面（一言で）",
    "そのとき困ったこと",
    "短所を克服するための工夫",
    "今後その短所とどう向き合っていきたいか",
  ],
};

const TARGET_LENGTH: Record<WizardVariant, number> = {
  gakuchika: 380,
  strength: 140,
  weakness: 140,
};

const TOPIC_LABEL: Record<WizardVariant, string> = {
  gakuchika: "学生時代に力を入れたこと（ガクチカ）",
  strength: "長所",
  weakness: "短所",
};

/** APIキーが無い場合の簡易フォールバック（課金なしで動作確認できる） */
function mockDraft(variant: WizardVariant, answers: string[]): string {
  const [a1, a2, a3, a4, a5] = answers.map((a) => a.trim());
  if (variant === "gakuchika") {
    return `私は${a1}に力を入れました。取り組む中で${a3}という課題に直面しましたが、${a4}ことでこれを乗り越えました。この経験から${a2}を学びました。今後は${a5}と考えています。`;
  }
  return `私の${TOPIC_LABEL[variant]}は${a1}です。${a2}という場面で、${a3}という課題がありましたが、${a4}ことで対応しました。今後は${a5}と考えています。`;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    variant?: WizardVariant;
    answers?: string[];
  };
  const variant = body.variant;
  const answers = (body.answers ?? []).map((a) => (a ?? "").trim());

  if (!variant || !QUESTION_LABELS[variant] || answers.length !== 5 || answers.some((a) => !a)) {
    return Response.json(
      { error: "入力内容が不足しています。5つの質問すべてに回答してください。" },
      { status: 400 }
    );
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return Response.json({ draft: mockDraft(variant, answers), source: "mock" });
  }

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    const labels = QUESTION_LABELS[variant];
    const qa = labels.map((label, i) => `【${label}】\n${answers[i]}`).join("\n\n");

    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      system:
        `あなたは就活生のエントリーシート作成を支援するアシスタントです。` +
        `学生が答えた5つの断片的な回答をもとに、「${TOPIC_LABEL[variant]}」について` +
        `自然な日本語の文章（一人称は「私」、である調ではなく丁寧すぎない敬体）にまとめてください。\n` +
        `\n【厳守事項】\n` +
        `・学生が答えた内容だけを使い、新しい事実やエピソードを創作しないこと。\n` +
        `・見出しや箇条書き、【】のラベルは付けず、本文の段落のみを出力すること。\n` +
        `・文字数は日本語で${TARGET_LENGTH[variant]}字以内を目安にすること。\n` +
        `・前後の説明文やコードブロックは付けず、本文のみを出力すること。`,
      messages: [
        {
          role: "user",
          content: `以下の回答をもとに、「${TOPIC_LABEL[variant]}」の文章を作成してください。\n\n${qa}`,
        },
      ],
    });

    const draft = response.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();

    if (!draft) throw new Error("empty draft");

    return Response.json({ draft, source: "claude" });
  } catch (error) {
    console.error("ES wizard API error:", error);
    // 失敗時は簡易合成にフォールバック（機能自体は止めない）
    return Response.json({ draft: mockDraft(variant, answers), source: "mock-fallback" });
  }
}
