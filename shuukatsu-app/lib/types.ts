export type LikertValue = 1 | 2 | 3 | 4 | 5;

export type Dimension =
  | "leadership"
  | "creativity"
  | "diligence"
  | "communication"
  | "analytical";

export interface Question {
  id: number;
  text: string;
  dimension: Dimension;
}

export interface Answer {
  questionId: number;
  value: LikertValue;
}

export interface DimensionScore {
  dimension: Dimension;
  score: number;
  label: string;
}

export interface PersonalityType {
  id: string;
  name: string;
  description: string;
  icon: string;
  dominantDimensions?: Dimension[];
}

export interface JobType {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredDimensions: Partial<Record<Dimension, number>>;
}

export interface DiagnosisResult {
  dimensionScores: DimensionScore[];
  personalityType: PersonalityType;
  strengths: string[];
  topJobTypes: { jobType: JobType; score: number }[];
  answers: Answer[];
}

export interface Company {
  company: string;
  industry: string;

  leadership: number;
  communication: number;
  logical: number;
  creativity: number;
  execution: number;

  url: string;

  strength: string;
}