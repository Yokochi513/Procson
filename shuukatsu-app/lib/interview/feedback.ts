import {
  InterviewAnswer,
  InterviewScore,
} from "./types";

export function generateFeedback(
  answers: InterviewAnswer[],
  score: InterviewScore
): string[] {

  const feedback: string[] = [];

  // 総合点
  if (score.total >= 90) {
    feedback.push("非常に完成度の高い回答です。");
  }
  else if (score.total >= 80) {
    feedback.push("全体的に良い内容ですが、さらに具体例を加えるとより良くなります。");
  }
  else {
    feedback.push("回答内容をもう少し詳しくすると評価が上がります。");
  }

  // 文字数
  const shortAnswer = answers.find(
    (a) => a.answer.length < 80
  );

  if (shortAnswer) {
    feedback.push(
      `「${shortAnswer.category ?? shortAnswer.question}」の回答が短いため、具体例を追加しましょう。`
    );
  }

  // 論理性
  if (score.logical < 80) {
    feedback.push(
      "『結論 → 理由 → 具体例』の順で話すと伝わりやすくなります。"
    );
  }

  // 熱意
  if (score.passion < 80) {
    feedback.push(
      "仕事への熱意や将来の目標をもう少し具体的に伝えましょう。"
    );
  }

  // 具体性
  if (score.specific < 80) {
    feedback.push(
      "数字や成果を入れると説得力が増します。"
    );
  }

  return feedback;
}