import { readFile } from "fs/promises";
import path from "path";
import { SlideTheme } from "./theme";

const SKILL_NAME = "es-slides";

/**
 * リポジトリの .claude/skills/es-slides/ からスキル一式
 * （SKILL.md・デザインシステム・コンテンツガイド・HTMLテンプレート）を読み込み、
 * Claudeへのシステムプロンプトを組み立てる。
 * スキル側を更新すればこのAPIの挙動も追従する。サーバー側でのみ使用すること。
 *
 * スキル本来の対話フェーズ（デザインヒアリング・pptx書き出し）はWebアプリでは
 * 実行できないため、「テーマは決定済み・出力はHTMLのみ」という前提を追記する。
 */
export async function buildEsSlidesPrompt(theme: SlideTheme): Promise<string> {
  const [skill, designSystem, contentGuide, template] = await Promise.all([
    readSkillFile("SKILL.md"),
    readSkillFile(path.join("references", "design-system.md")),
    readSkillFile(path.join("references", "content-guide.md")),
    readSkillFile(path.join("assets", "slide-template.html")),
  ]);

  return `${stripFrontmatter(skill).trim()}

---

# references/design-system.md

${designSystem.trim()}

---

# references/content-guide.md

${contentGuide.trim()}

---

# assets/slide-template.html

\`\`\`html
${template.trim()}
\`\`\`

---

# このAPI実行環境での追加ルール（最優先）

あなたはWebアプリのAPIとして1回の応答でスライドHTMLを完成させる。対話はできない。

- **フェーズ1（デザインヒアリング）は実施しない。** 配色は利用者が選択済みで、下記のHEXを使う。
  slide-template.html の \`:root\` のCSS変数を、この値でそのまま置き換えること。
  - --navy: ${theme.navy}
  - --navy-2: ${theme.navy2}
  - --blue: ${theme.blue}
  - --line: ${theme.line}
  - --ink: ${theme.ink}
  - --muted: ${theme.muted}
  - --card: ${theme.card}
  - --card-bd: ${theme.cardBd}
  - --page: ${theme.page}
  - --poly-a: ${theme.polyA}
  - --poly-b: ${theme.polyB}
- **フェーズ4・5（pptx書き出し・整合確認）は実施しない。** 成果物はHTMLのみ。
- 本文はフェーズ2（content-guide.md）に従い、ユーザーが送るESから作る。事実を創作せず、
  ESに無い固有情報（大学名・氏名等）は「○○大学」「氏名」等のプレースホルダのまま残す。
- 出力は **slide-template.html と同じ構造の完全なHTMLドキュメントのみ**。
  \`<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>就活スライド</title><style>…</style></head><body>…</body></html>\` の形にする。
  説明文・前置き・Markdownのコードフェンスは一切付けない。1文字目から \`<!doctype html>\` で始めること。`;
}

async function readSkillFile(relativePath: string): Promise<string> {
  // next dev / next start はアプリのルート（shuukatsu-app/）で動くため、
  // まず1つ上のリポジトリルートを探し、念のため cwd 直下も候補にする。
  const candidates = [
    path.join(process.cwd(), "..", ".claude", "skills", SKILL_NAME, relativePath),
    path.join(process.cwd(), ".claude", "skills", SKILL_NAME, relativePath),
  ];

  for (const candidate of candidates) {
    try {
      return await readFile(candidate, "utf-8");
    } catch {
      // 次の候補を試す
    }
  }
  throw new Error(`skill file not found: ${SKILL_NAME}/${relativePath}`);
}

function stripFrontmatter(markdown: string): string {
  const match = markdown.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  return match ? markdown.slice(match[0].length) : markdown;
}
