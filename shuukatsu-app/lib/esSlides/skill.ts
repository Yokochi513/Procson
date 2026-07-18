import { readFile } from "fs/promises";
import path from "path";
import { SlideTheme } from "./theme";

// ESスライドスキルは .claude/skills/ ではなくリポジトリ直下に置かれている。
const SKILL_DIR = "skill_es-presentation";

/**
 * リポジトリの skill_es-presentation/ からスキル一式
 * （SKILL.md・デザイン詳細）を読み込み、Claudeへのシステムプロンプトを組み立てる。
 * スキル側を更新すればこのAPIの挙動も追従する。サーバー側でのみ使用すること。
 *
 * スキル本来の対話フェーズ（テンプレートのヒアリング・HTML確認・pptx書き出し）は
 * Webアプリでは実行できないため、「配色は決定済み・出力はHTMLのみ」という前提を追記する。
 * shuukatu-app-back/main.py の build_es_slides_prompt と同一内容。
 */
export async function buildEsSlidesPrompt(theme: SlideTheme): Promise<string> {
  const [skill, design] = await Promise.all([
    readSkillFile("SKILL.md"),
    readSkillFile(path.join("references", "design.md")),
  ]);

  return `${stripFrontmatter(skill).trim()}

---

# references/design.md

${design.trim()}

---

# このAPI実行環境での追加ルール（最優先）

あなたはWebアプリのAPIとして1回の応答でスライドHTMLを完成させる。対話はできない。

- **「テンプレートの扱い」のヒアリングは実施しない。** 配色は利用者が選択済みで、
  references/design.md の作例の各役割に下記のHEXをそのまま当てはめる。
  - メイン（見出し・ヘッダーバー・名刺カード）: ${theme.navy}（濃い側 ${theme.navy2}）
  - アクセント（強調文字・数値・効果カード）: ${theme.blue}
  - 本文テキスト: ${theme.ink} ／ 補足・添え字: ${theme.muted}
  - 背景: ${theme.page} ／ カード背景: ${theme.card}
  - カード枠: ${theme.cardBd} ／ 区切り線: ${theme.line}
  - 背景のローポリ装飾: ${theme.polyA}・${theme.polyB}
- **HTMLプレビュー確認の対話・テキストサイズの問いかけ・.pptx への書き出し・目視QAは実施しない。**
  成果物はHTMLのみ。
- 本文はユーザーが送るESから「3種類のレイアウト」に従って作る。事実を創作せず、
  ESに無い固有情報（大学名・氏名等）は「○○大学」「氏名」等のプレースホルダのまま残す。
- 3枚のスライド（①自己紹介 ②志望動機 ③自己PR）は、16:9（1280×720px）の枠を縦に並べた
  1つのHTMLにまとめる。文字サイズ・余白は references/design.md の作例に従い、本文は18px以上。
- 出力は **完全なHTMLドキュメントのみ**。
  \`<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>就活スライド</title><style>…</style></head><body>…</body></html>\` の形にする。
  説明文・前置き・Markdownのコードフェンスは一切付けない。1文字目から \`<!doctype html>\` で始めること。`;
}

async function readSkillFile(relativePath: string): Promise<string> {
  // next dev / next start はアプリのルート（shuukatsu-app/）で動くため、
  // まず1つ上のリポジトリルートを探し、念のため cwd 直下も候補にする。
  const candidates = [
    path.join(process.cwd(), "..", SKILL_DIR, relativePath),
    path.join(process.cwd(), SKILL_DIR, relativePath),
  ];

  for (const candidate of candidates) {
    try {
      return await readFile(candidate, "utf-8");
    } catch {
      // 次の候補を試す
    }
  }
  throw new Error(`skill file not found: ${SKILL_DIR}/${relativePath}`);
}

function stripFrontmatter(markdown: string): string {
  const match = markdown.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  return match ? markdown.slice(match[0].length) : markdown;
}
