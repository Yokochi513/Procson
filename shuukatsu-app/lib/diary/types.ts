/** 日記分析のモード。リポジトリの .claude/skills/ にあるスキル名と対応する。 */
export type DiaryAnalysisMode = "gakuchika-seed" | "interview-deepdive";

export const diaryModes: Record<
  DiaryAnalysisMode,
  { skillName: string; label: string }
> = {
  "gakuchika-seed": {
    skillName: "gakuchika-seed-from-diary",
    label: "ガクチカの種さがし",
  },
  "interview-deepdive": {
    skillName: "interview-deepdive-from-diary",
    label: "面接深掘り質問づくり",
  },
};

export function isDiaryAnalysisMode(value: string): value is DiaryAnalysisMode {
  return value in diaryModes;
}
