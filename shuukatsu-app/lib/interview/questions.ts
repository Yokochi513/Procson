import { InterviewQuestion } from "./types";

export const defaultQuestions: InterviewQuestion[] = [
  {
    id: 1,
    question: "自己紹介をしてください。",
    category: "自己紹介",
  },
  {
    id: 2,
    question: "志望動機を教えてください。",
    category: "志望動機",
  },
  {
    id: 3,
    question: "学生時代に力を入れたことを教えてください。",
    category: "ガクチカ",
  },
  {
    id: 4,
    question: "あなたの強みは何ですか？",
    category: "自己PR",
  },
  {
    id: 5,
    question: "あなたの弱みは何ですか？",
    category: "自己PR",
  },
  {
    id: 6,
    question: "失敗経験とそこから学んだことを教えてください。",
    category: "経験",
  },
  {
    id: 7,
    question: "チームで協力した経験を教えてください。",
    category: "協調性",
  },
  {
    id: 8,
    question: "入社後に挑戦したいことを教えてください。",
    category: "将来",
  },
  {
    id: 9,
    question: "あなたを採用するメリットを教えてください。",
    category: "自己PR",
  },
  {
    id: 10,
    question: "最後に伝えたいことはありますか？",
    category: "最後",
  },
];

export function getQuestions(company?: string): InterviewQuestion[] {
  const questions = [...defaultQuestions];

  switch (company) {
    case "村田製作所":
      questions[7].question =
        "研究開発で挑戦したいことを教えてください。";
      break;

    case "クラレ":
      questions[7].question =
        "素材メーカーで働きたい理由を教えてください。";
      break;

    case "中国銀行":
      questions[6].question =
        "お客様との信頼関係を築くために大切だと思うことは何ですか？";
      break;

    default:
      break;
  }

  return questions;
}