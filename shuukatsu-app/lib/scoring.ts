import questions from "@/data/questions.json";
import jobTypes from "@/data/jobTypes.json";
import personalityTypesData from "@/data/personalityTypes.json";
import type {
  Answer,
  Dimension,
  DimensionScore,
  DiagnosisResult,
  JobType,
  LikertValue,
  PersonalityType,
} from "./types";

const DIMENSION_LABELS: Record<Dimension, string> = {
  leadership: "リーダーシップ",
  creativity: "創造性",
  diligence: "粘り強さ",
  communication: "コミュニケーション",
  analytical: "分析力",
};

const STRENGTH_MESSAGES: Record<Dimension, string> = {
  leadership: "チームを牽引する力がある",
  creativity: "新しいアイデアを生み出す力がある",
  diligence: "コツコツ努力を続けられる",
  communication: "人とのコミュニケーションが得意",
  analytical: "論理的・分析的に物事を考えられる",
};

const personalityTypes = personalityTypesData as PersonalityType[];

const ALL_DIMENSIONS: Dimension[] = [
  "leadership",
  "creativity",
  "diligence",
  "communication",
  "analytical",
];

function normalizeLikert(value: LikertValue): number {
  return ((value - 1) / 4) * 100;
}

export function calculateDimensionScores(answers: Answer[]): DimensionScore[] {
  return ALL_DIMENSIONS.map((dimension) => {
    const relatedAnswers = answers.filter((a) => {
      const q = questions.find((q) => q.id === a.questionId);
      return q?.dimension === dimension;
    });

    const avg =
      relatedAnswers.length > 0
        ? relatedAnswers.reduce((sum, a) => sum + normalizeLikert(a.value), 0) /
          relatedAnswers.length
        : 0;

    return {
      dimension,
      score: Math.round(avg),
      label: DIMENSION_LABELS[dimension],
    };
  });
}

export function determinePersonalityType(
  scores: DimensionScore[]
): PersonalityType {
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const top2 = sorted.slice(0, 2).map((s) => s.dimension);

  if (scores.every((s) => s.score >= 60)) {
    return personalityTypes.find((p) => p.id === "allrounder")!;
  }

  const matched = personalityTypes.find((p) => {
    if (p.id === "allrounder") return false;
    const dom = p.dominantDimensions ?? [];
    return dom.every((d) => top2.includes(d));
  });

  if (matched) return matched;

  const topDim = sorted[0].dimension;
  const fallbackMap: Record<Dimension, string> = {
    leadership: "leader",
    creativity: "creator",
    diligence: "supporter",
    communication: "supporter",
    analytical: "analyst",
  };

  return personalityTypes.find((p) => p.id === fallbackMap[topDim])!;
}

export function extractStrengths(scores: DimensionScore[]): string[] {
  const strengths = scores
    .filter((s) => s.score >= 70)
    .map((s) => STRENGTH_MESSAGES[s.dimension]);

  if (strengths.length === 0) {
    const top = [...scores].sort((a, b) => b.score - a.score)[0];
    return [`${top.label}が特に高い`];
  }

  return strengths;
}

export function calculateJobTypeScores(
  dimensionScores: DimensionScore[]
): { jobType: JobType; score: number }[] {
  const userVector: Record<Dimension, number> = {
    leadership: 0,
    creativity: 0,
    diligence: 0,
    communication: 0,
    analytical: 0,
  };
  dimensionScores.forEach((s) => {
    userVector[s.dimension] = s.score / 100;
  });

  return (jobTypes as JobType[])
    .map((jobType) => {
      const weights = jobType.requiredDimensions;
      let dotProduct = 0;
      let userMagnitude = 0;
      let jobMagnitude = 0;

      ALL_DIMENSIONS.forEach((dim) => {
        const u = userVector[dim];
        const j = weights[dim] ?? 0;
        dotProduct += u * j;
        userMagnitude += u * u;
        jobMagnitude += j * j;
      });

      const similarity =
        userMagnitude && jobMagnitude
          ? dotProduct / (Math.sqrt(userMagnitude) * Math.sqrt(jobMagnitude))
          : 0;

      return {
        jobType,
        score: Math.round(similarity * 100),
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function analyzeAnswers(answers: Answer[]): DiagnosisResult {
  const dimensionScores = calculateDimensionScores(answers);
  const personalityType = determinePersonalityType(dimensionScores);
  const strengths = extractStrengths(dimensionScores);
  const topJobTypes = calculateJobTypeScores(dimensionScores);

  return {
    dimensionScores,
    personalityType,
    strengths,
    topJobTypes,
    answers,
  };
}
