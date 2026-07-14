import { EntrySheetAnswers } from "./types";
import { EntrySheetScore } from "./scoring";
import { entrySheetFields } from "./fields";

export function generateEntrySheetFeedback(
  answers: EntrySheetAnswers,
  score: EntrySheetScore
): string[] {
  const feedback: string[] = [];

  if (score.total >= 85) {
    feedback.push("全体的に完成度の高いエントリーシートです。");
  } else if (score.total >= 70) {
    feedback.push("良い内容ですが、具体例を増やすとさらに良くなります。");
  } else {
    feedback.push("各項目の内容をもう少し詳しく書くと評価が上がります。");
  }

  const emptyField = entrySheetFields.find(
    (field) => !(answers[field.id] ?? "").trim()
  );
  if (emptyField) {
    feedback.push(`「${emptyField.label}」が未入力です。まずは埋めてみましょう。`);
  }

  const shortField = entrySheetFields.find((field) => {
    const text = answers[field.id] ?? "";
    return text.trim() && text.length < field.maxLength * 0.3;
  });
  if (shortField) {
    feedback.push(
      `「${shortField.label}」の分量が少なめです。エピソードを具体的に書き足しましょう。`
    );
  }

  if (score.concreteness < 75) {
    feedback.push("数字や固有名詞を入れると、説得力のある内容になります。");
  }

  if (score.logic < 75) {
    feedback.push(
      "『結論 → 理由 → 具体例 → まとめ』の順で書くと伝わりやすくなります。"
    );
  }

  return feedback;
}
