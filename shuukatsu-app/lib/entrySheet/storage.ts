import { EntrySheetAnswers } from "./types";

const STORAGE_KEY = "entry-sheet-answers";

export function saveEntrySheet(answers: EntrySheetAnswers): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }
}

export function loadEntrySheet(): EntrySheetAnswers {
  if (typeof window === "undefined") return {};

  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function clearEntrySheet(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
