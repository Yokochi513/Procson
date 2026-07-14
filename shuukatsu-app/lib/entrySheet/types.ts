export interface EntrySheetField {
  id: string;
  label: string;
  placeholder: string;
  maxLength: number;
}

export type EntrySheetAnswers = Record<string, string>;
