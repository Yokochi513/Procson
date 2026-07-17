import { readFile } from "fs/promises";
import path from "path";
import { DiaryAnalysisMode, diaryModes } from "./types";

/**
 * リポジトリの .claude/skills/<skillName>/SKILL.md を読み込み、
 * YAMLフロントマターを除いた本文（＝Claudeへのシステムプロンプト）を返す。
 *
 * next dev / next start はアプリのルート（shuukatsu-app/）で動くため、
 * まず1つ上のリポジトリルートを探し、念のため cwd 直下も候補にする。
 * サーバー側でのみ使用すること。
 */
export async function loadSkillPrompt(
  mode: DiaryAnalysisMode
): Promise<string> {
  const { skillName } = diaryModes[mode];
  const candidates = [
    path.join(process.cwd(), "..", ".claude", "skills", skillName, "SKILL.md"),
    path.join(process.cwd(), ".claude", "skills", skillName, "SKILL.md"),
  ];

  let raw: string | null = null;
  for (const candidate of candidates) {
    try {
      raw = await readFile(candidate, "utf-8");
      break;
    } catch {
      // 次の候補を試す
    }
  }
  if (raw === null) {
    throw new Error(`SKILL.md not found for skill: ${skillName}`);
  }

  return stripFrontmatter(raw).trim();
}

function stripFrontmatter(markdown: string): string {
  const match = markdown.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  return match ? markdown.slice(match[0].length) : markdown;
}
