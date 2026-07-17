import type { NextRequest } from "next/server";
import { getApiKey } from "@/lib/ai/apiKey";
import { loadSkillPrompt } from "@/lib/diary/skills";
import { mockDiaryAnalysis } from "@/lib/diary/mock";
import { isDiaryAnalysisMode } from "@/lib/diary/types";

// このルートはリクエストごとに実行する（キャッシュしない）
export const dynamic = "force-dynamic";

/**
 * 日記を分析して、ガクチカの種 / 面接深掘り質問 を返す。
 * リポジトリの .claude/skills/ にある SKILL.md をシステムプロンプトとして
 * そのまま使うため、スキルを更新すればこのAPIの挙動も変わる。
 * ANTHROPIC_API_KEY が無ければモックを返す（課金なしで動作確認できる）。
 */
export async function POST(request: NextRequest) {
  const { diary, mode } = (await request.json()) as {
    diary?: string;
    mode?: string;
  };

  if (!mode || !isDiaryAnalysisMode(mode)) {
    return Response.json({ error: "invalid mode" }, { status: 400 });
  }
  if (!diary?.trim()) {
    return Response.json({ error: "diary is empty" }, { status: 400 });
  }

  const apiKey = getApiKey();

  // --- キーが無い場合はモックを返す ---
  if (!apiKey) {
    return Response.json({ result: mockDiaryAnalysis(mode), source: "mock" });
  }

  // --- キーがある場合はスキルを読み込んで Claude を呼ぶ ---
  try {
    const skillPrompt = await loadSkillPrompt(mode);

    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 4096,
      system: skillPrompt,
      messages: [
        {
          role: "user",
          content: `以下は就活生が書いた日記です。スキルの手順に従って分析し、指定の出力フォーマットのMarkdownだけを出力してください。\n\n${diary}`,
        },
      ],
    });

    const result = response.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("\n")
      .trim();

    return Response.json({ result, source: "claude" });
  } catch (error) {
    console.error("diary-analysis error:", error);
    // 失敗時はモックにフォールバック
    return Response.json({
      result: mockDiaryAnalysis(mode),
      source: "mock-fallback",
    });
  }
}
