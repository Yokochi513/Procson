import { InterviewResult } from "./types";

const STORAGE_KEY = "interview_result";

export function saveInterviewResult(
  result: InterviewResult
) {
  const history = loadInterviewHistory();

  history.unshift(result);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(history)
  );
}

export function loadInterviewHistory(): InterviewResult[] {

  if (typeof window === "undefined") {
    return [];
  }

  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    return [];
  }

  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function clearInterviewHistory() {
  localStorage.removeItem(STORAGE_KEY);
}