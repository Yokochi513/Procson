import type { NextRequest } from "next/server";
import { entrySheetFields } from "@/lib/entrySheet/fields";
import { EntrySheetAnswers } from "@/lib/entrySheet/types";
import { mockEsFeedback } from "@/lib/ai/esFeedbackMock";

// このルートはリクエストごとに実行する（キャッシュしない）
export const dynamic = "force-dynamic";

/**
 * エントリーシートの内容に対してAIコメントを返す。
 * ANTHROPIC_API_KEY が設定されていれば Claude を呼び出し、
 * 無ければモックのコメントを返す（課金なしで動作確認できる）。
 */
export async function POST(request: NextRequest) {
  const { answers } = (await request.json()) as {
    answers: EntrySheetAnswers;
  };

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // --- キーが無い場合はモックを返す（現状はこちら） ---
  if (!apiKey) {
    return Response.json({ comment: mockEsFeedback(answers), source: "mock" });
  }

  // --- キーがある場合は実際の Claude API を呼ぶ（後で有効化） ---
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic();

    const es = entrySheetFields
      .map((f) => `【${f.label}】\n${(answers[f.id] ?? "").trim() || "（未記入）"}`)
      .join("\n\n");

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      system:
        "あなたは就活生を支援する、経験豊富で親身な面接官です。提出されたエントリーシートに対して、良い点を1つ、改善点を2つ、日本語で簡潔に（300字以内）フィードバックしてください。就活生を励ます前向きなトーンで書いてください。",
      messages: [
        {
          role: "user",
          content: `以下のエントリーシートにフィードバックをお願いします。\n\n${es}`,
        },
      ],
    });

    const comment = response.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("\n")
      .trim();

    return Response.json({ comment, source: "claude" });
  } catch (error) {
    console.error("Claude API error:", error);
    // 失敗時はモックにフォールバック
    return Response.json({
      comment: mockEsFeedback(answers),
      source: "mock-fallback",
    });
  }
}
