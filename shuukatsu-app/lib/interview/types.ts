export interface InterviewQuestion {
  id: number;
  question: string;
  category: string;
}

export interface InterviewAnswer {
  questionId: number;
  question: string;
  category: string;
  answer: string;
}

export interface InterviewAnswer {
  questionId: number;
  question: string;
  answer: string;
}

export interface InterviewScore {
  total: number;
  logical: number;
  specific: number;
  passion: number;
  communication: number;
}

export interface InterviewResult {
  company: string;
  date: string;
  answers: InterviewAnswer[];
  score: InterviewScore;
  feedback: string[];
}