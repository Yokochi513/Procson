import { DiagnosisResult } from "@/lib/types";

export function generateReason(
  result: DiagnosisResult
): string {

  const score = (name: string) =>
    result.dimensionScores.find((d) => d.dimension === name)?.score ?? 0;

  const leadership = score("leadership");
  const communication = score("communication");
  const logical = score("analytical");
  const creativity = score("creativity");
  const execution = score("diligence");

  const strengths: string[] = [];
  const jobs: string[] = [];

  if (leadership >= 4) {
    strengths.push("リーダーシップ");
    jobs.push("人をまとめる仕事");
  }

  if (communication >= 4) {
    strengths.push("コミュニケーション能力");
    jobs.push("チームで協力する仕事");
  }

  if (logical >= 4) {
    strengths.push("論理的思考力");
    jobs.push("分析や課題解決");
  }

  if (creativity >= 4) {
    strengths.push("創造力");
    jobs.push("新しいアイデアを生み出す仕事");
  }

  if (execution >= 4) {
    strengths.push("実行力");
    jobs.push("最後までやり遂げる仕事");
  }

  let text = "";

  if (strengths.length > 0) {
    text += `あなたは「${strengths.join("・")}」が強みです。`;
  } else {
    text += "あなたは能力のバランスが良く、さまざまな仕事に適応できるタイプです。";
  }

  if (jobs.length > 0) {
    text += `特に「${jobs.join("・")}」で能力を発揮しやすいでしょう。`;
  }

  text += "診断結果と企業が求める能力をもとに、あなたに合う企業をおすすめしています。";

  return text;
}