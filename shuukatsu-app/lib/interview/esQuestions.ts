import { EntrySheetAnswers } from "../entrySheet/types";
import { entrySheetFields } from "../entrySheet/fields";
import { InterviewQuestion } from "./types";

const followUps: Record<string, string[]> = {
  selfPr: [
    "自己PRで書いた強みは、具体的にどんな場面で発揮されましたか？",
    "その強みを仕事でどう活かしていきたいですか？",
  ],
  motivation: [
    "志望動機に書いた内容について、他社ではなく弊社を選ぶ決め手は何ですか？",
    "入社後、その志望動機をどう実現していきたいですか？",
  ],
  gakuchika: [
    "学生時代に力を入れたことについて、一番苦労した点は何ですか？",
    "その経験から得た学びを、仕事でどう活かせると思いますか？",
  ],
  strengthWeakness: [
    "短所を克服するために、日頃どんな工夫をしていますか？",
    "長所が最も発揮されたエピソードを教えてください。",
  ],
};

export function getQuestionsFromEntrySheet(
  answers: EntrySheetAnswers
): InterviewQuestion[] {
  const questions: InterviewQuestion[] = [];
  let id = 1;

  entrySheetFields.forEach((field) => {
    const content = (answers[field.id] ?? "").trim();
    if (!content) return;

    followUps[field.id]?.forEach((question) => {
      questions.push({
        id: id++,
        question,
        category: field.label,
      });
    });
  });

  return questions;
}
