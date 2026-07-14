"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

type Props = {
  scores: {
    label: string;
    score: number;
  }[];
};

export default function AbilityRadar({ scores }: Props) {
  const data = scores.map((item) => ({
    subject: item.label,
    value: item.score,
    fullMark: 100,
  }));

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid />

          <PolarAngleAxis dataKey="subject" />

          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
          />

          <Radar
            name="能力"
            dataKey="value"
            stroke="#4F46E5"
            fill="#6366F1"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}