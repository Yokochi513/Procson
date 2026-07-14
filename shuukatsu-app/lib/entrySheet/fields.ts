import { EntrySheetField } from "./types";

export const entrySheetFields: EntrySheetField[] = [
  {
    id: "selfPr",
    label: "自己PR",
    placeholder: "あなたの強みと、それを裏付けるエピソードを書きましょう。",
    maxLength: 400,
  },
  {
    id: "motivation",
    label: "志望動機",
    placeholder: "なぜこの企業を志望するのか、具体的に書きましょう。",
    maxLength: 400,
  },
  {
    id: "gakuchika",
    label: "学生時代に力を入れたこと",
    placeholder: "取り組んだ内容・工夫・成果を書きましょう。",
    maxLength: 400,
  },
  {
    id: "strengthWeakness",
    label: "長所・短所",
    placeholder: "長所と短所、それぞれをどう活かす/克服しているか書きましょう。",
    maxLength: 300,
  },
];
