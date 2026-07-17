"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

export interface Evaluation {
  logical: number;
  specific: number;
  passion: number;
  communication: number;
  total: number;
  summary?: string;
  improvements?: string[];
}

interface Props {
  evaluation: Evaluation;
}

/** 5項目のレーダーチャートで面接評価を表示する */
export function EvaluationRadar({ evaluation }: Props) {
  const data = [
    { label: "論理性", value: clamp(evaluation.logical) },
    { label: "具体性", value: clamp(evaluation.specific) },
    { label: "熱意", value: clamp(evaluation.passion) },
    { label: "コミュニケーション力", value: clamp(evaluation.communication) },
    { label: "総合評価", value: clamp(evaluation.total) },
  ];

  return (
    <div className="w-full">
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="75%">
            <PolarGrid />
            <PolarAngleAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#374151" }}
            />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Radar
              dataKey="value"
              stroke="#ff7a1a"
              fill="#ff7a1a"
              fillOpacity={0.45}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 text-center">
        {data.map((d) => (
          <div key={d.label} className="bg-gray-50 rounded-lg py-2">
            <div className="text-xs text-gray-500">{d.label}</div>
            <div className="text-lg font-bold text-[#ff7a1a]">{d.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function clamp(n: number): number {
  if (typeof n !== "number" || Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}
