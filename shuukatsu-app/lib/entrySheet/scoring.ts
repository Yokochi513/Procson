import { EntrySheetAnswers } from "./types";
import { entrySheetFields } from "./fields";

export interface EntrySheetScore {
  total: number;
  volume: number;
  concreteness: number;
  logic: number;
}

export function calculateEntrySheetScore(
  answers: EntrySheetAnswers
): EntrySheetScore {
  let volume = 60;
  let concreteness = 60;
  let logic = 60;

  entrySheetFields.forEach((field) => {
    const text = answers[field.id] ?? "";
    const len = text.length;

    if (len >= field.maxLength * 0.8) {
      volume += 10;
    } else if (len >= field.maxLength * 0.5) {
      volume += 6;
    } else if (len >= field.maxLength * 0.25) {
      volume += 3;
    }

    if (/[0-9０-９]/.test(text) || /(人|回|年|位|円|%)/.test(text)) {
      concreteness += 8;
    }

    if (/(そのため|だから|結果として|なぜなら|理由は)/.test(text)) {
      logic += 8;
    }
  });

  volume = Math.min(volume, 100);
  concreteness = Math.min(concreteness, 100);
  logic = Math.min(logic, 100);

  const total = Math.round((volume + concreteness + logic) / 3);

  return { total, volume, concreteness, logic };
}
