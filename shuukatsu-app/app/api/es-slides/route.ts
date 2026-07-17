import type { NextRequest } from "next/server";
import { getApiKey } from "@/lib/ai/apiKey";
import { buildEsSlidesPrompt } from "@/lib/esSlides/skill";
import { mockSlidesHtml } from "@/lib/esSlides/mock";
import { isSlideTheme } from "@/lib/esSlides/theme";

// このルートはリクエストごとに実行する（キャッシュしない）
export const dynamic = "force-dynamic";

/**
 * ESの文章と配色テーマから、就活スライド（①自己紹介②志望動機③自己PR）の
 * HTMLを生成して返す。リポジトリの .claude/skills/es-slides/ にある
 * SKILL.md・references・テンプレートをシステムプロンプトとしてそのまま使うため、
 * スキルを更新すればこのAPIの挙動も変わる。
 * ANTHROPIC_API_KEY が無ければモックを返す（課金なしで動作確認できる）。
 */
export async function POST(request: NextRequest) {
  const { es, theme } = (await request.json()) as {
    es?: string;
    theme?: unknown;
  };

  if (!isSlideTheme(theme)) {
    return Response.json({ error: "invalid theme" }, { status: 400 });
  }
  if (!es?.trim()) {
    return Response.json({ error: "es is empty" }, { status: 400 });
  }

  const apiKey = getApiKey();

  // --- キーが無い場合はモックを返す ---
  if (!apiKey) {
    return Response.json({ html: mockSlidesHtml(theme), source: "mock" });
  }

  // --- キーがある場合はスキルを読み込んで Claude を呼ぶ ---
  try {
    const systemPrompt = await buildEsSlidesPrompt(theme);

    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 16384,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `以下は就活生のエントリーシートです。スキルの手順（フェーズ2〜3）に従って3枚のスライドを作り、完全なHTMLドキュメントだけを出力してください。\n\n${es}`,
        },
      ],
    });

    const raw = response.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("\n")
      .trim();

    const html = extractHtml(raw);
    if (!html) {
      throw new Error("response did not contain an HTML document");
    }

    return Response.json({ html, source: "claude" });
  } catch (error) {
    console.error("es-slides error:", error);
    // 失敗時はモックにフォールバック
    return Response.json({
      html: mockSlidesHtml(theme),
      source: "mock-fallback",
    });
  }
}

/**
 * モデルの応答からHTMLドキュメント本体を取り出す。
 * 指示上はHTMLのみを返すはずだが、コードフェンスや前置きが付いた場合にも耐える。
 */
function extractHtml(raw: string): string | null {
  const fenced = raw.match(/```(?:html)?\s*([\s\S]*?)```/);
  const candidate = (fenced ? fenced[1] : raw).trim();
  const start = candidate.search(/<!doctype html/i);
  if (start === -1) return null;
  return candidate.slice(start);
}
