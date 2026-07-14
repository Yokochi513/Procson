import { InterviewAnswer, InterviewScore } from "./types";

export function calculateScore(
  answers: InterviewAnswer[]
): InterviewScore {

  let logical = 70;
  let specific = 70;
  let passion = 70;
  let communication = 70;

  answers.forEach((a) => {

    const len = a.answer.length;

    // 文字数評価
    if (len >= 300) {
      logical += 3;
      specific += 5;
      communication += 3;
    }
    else if (len >= 200) {
      logical += 2;
      specific += 3;
      communication += 2;
    }
    else if (len >= 100) {
      logical += 1;
    }

    // 熱意
    if (
      a.answer.includes("挑戦") ||
      a.answer.includes("努力") ||
      a.answer.includes("成長")
    ) {
      passion += 3;
    }

    // 論理性
    if (
      a.answer.includes("そのため") ||
      a.answer.includes("だから") ||
      a.answer.includes("結果")
    ) {
      logical += 2;
    }

    // 具体性
    if (
      a.answer.includes("人") ||
      a.answer.includes("回") ||
      a.answer.includes("年")
    ) {
      specific += 2;
    }
  });

  logical = Math.min(logical, 100);
  specific = Math.min(specific, 100);
  passion = Math.min(passion, 100);
  communication = Math.min(communication, 100);

  const total = Math.round(
    (logical +
      specific +
      passion +
      communication) / 4
  );

  return {
    total,
    logical,
    specific,
    passion,
    communication,
  };
}