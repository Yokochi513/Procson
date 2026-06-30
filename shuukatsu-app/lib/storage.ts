import type { Answer, DiagnosisResult } from "./types";

const ANSWERS_KEY = "job-diagnosis-answers";
const RESULT_KEY = "job-diagnosis-result";

export function saveAnswers(answers: Answer[]): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
  }
}

export function loadAnswers(): Answer[] | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(ANSWERS_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveResult(result: DiagnosisResult): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
  }
}

export function loadResult(): DiagnosisResult | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(RESULT_KEY);
  return raw ? JSON.parse(raw) : null;
}
