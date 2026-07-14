import { defaultQuestions } from "./questions";

export type ChatStep =
  | { type: "speak"; text: string }
  | { type: "ask"; text: string; category: string };

/**
 * チャット形式AI面接の進行スクリプト。
 * speak: 面接官が話すだけ（話し終わったら自動で次へ進む）
 * ask: 面接官が質問し、ユーザーの回答を待つ
 */
export function buildChatScript(): ChatStep[] {
  const steps: ChatStep[] = [
    { type: "speak", text: "どうぞ、お入りください。" },
    { type: "speak", text: "本日はお越しいただきありがとうございます。" },
    { type: "ask", text: "それでは、お名前をお願いします。", category: "お名前" },
    { type: "speak", text: "ありがとうございます。" },
    { type: "ask", text: "それでは自己紹介をお願いします。", category: "自己紹介" },
    { type: "speak", text: "ありがとうございます。" },
  ];

  // 自己紹介は既に個別の質問で聞いているため除外し、
  // 「学生時代に力を入れたこと」を最初に、残りは元の順番で続ける。
  const remaining = defaultQuestions.filter((q) => q.category !== "自己紹介");
  const gakuchika = remaining.find((q) => q.category === "ガクチカ");
  const rest = remaining.filter((q) => q.category !== "ガクチカ");
  const orderedQuestions = gakuchika ? [gakuchika, ...rest] : rest;

  orderedQuestions.forEach((q) => {
    steps.push({ type: "ask", text: q.question, category: q.category });
    steps.push({ type: "speak", text: "ありがとうございます。" });
  });

  steps.push({
    type: "speak",
    text: "本日は以上で面接は終了です。お忙しい中お越しいただき、ありがとうございました。",
  });

  return steps;
}
