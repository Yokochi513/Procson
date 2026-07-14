import { Company, DiagnosisResult } from "./types";

export function calculateMatches(
  result: DiagnosisResult,
  companies: Company[]
) {
  const scores = {
    leadership:
      result.dimensionScores.find(
        (d) => d.dimension === "leadership"
      )?.score ?? 0,

    communication:
      result.dimensionScores.find(
        (d) => d.dimension === "communication"
      )?.score ?? 0,

    creativity:
      result.dimensionScores.find(
        (d) => d.dimension === "creativity"
      )?.score ?? 0,

    logical:
      result.dimensionScores.find(
        (d) => d.dimension === "analytical"
      )?.score ?? 0,

    execution:
      result.dimensionScores.find(
        (d) => d.dimension === "diligence"
      )?.score ?? 0,
  };

  return companies
    .map((company) => {
      const distance =
        Math.abs(scores.leadership / 20 - company.leadership) +
        Math.abs(scores.communication / 20 - company.communication) +
        Math.abs(scores.logical / 20 - company.logical) +
        Math.abs(scores.creativity / 20 - company.creativity) +
        Math.abs(scores.execution / 20 - company.execution);

      return {
        ...company,
        match: Math.max(
          0,
          Math.round(100 - distance * 10)
        ),
      };
    })
    .sort((a, b) => b.match - a.match)
    .slice(0, 10);
}