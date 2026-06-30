"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { DiagnosisResult } from "@/lib/types";
import { loadResult } from "@/lib/storage";
import { loadCompanies } from "@/lib/loadCompanies";
import { calculateMatches } from "@/lib/matching";
import { PersonalityBadge } from "@/components/result/PersonalityBadge";
import { StrengthList } from "@/components/result/StrengthList";
import { JobTypeGrid } from "@/components/result/JobTypeGrid";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { generateReason } from "@/lib/generateReason";
import AbilityRadar from "@/components/result/AbilityRadar";

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);

useEffect(() => {
  const data = loadResult();

  if (!data) {
    router.push("/diagnosis");
    return;
  }

  setResult(data);

  loadCompanies().then((list) => {
    const matched = calculateMatches(
      data,
      list
    );

    setCompanies(matched);
  });

}, [router]);

  if (!result) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">
        読み込み中...
      </div>
    );
  }

  const reason = generateReason(result);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">診断結果</h1>
      <p className="text-gray-500 mb-8">あなたの自己分析結果です</p>

      <div className="space-y-8">
        <PersonalityBadge type={result.personalityType} />
        <StrengthList strengths={result.strengths} />

        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            🎯 向いている職種
          </h3>
          <JobTypeGrid jobTypes={result.topJobTypes} />
        </div>

        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            📊 能力バランス
          </h3>
          <Card>
  <h3 className="text-lg font-bold mb-4">
    🎯 能力レーダーチャート
  </h3>

  <AbilityRadar
    scores={result.dimensionScores}
  />
</Card>
          <div className="space-y-3">
            {result.dimensionScores.map((dim) => (
              <div key={dim.dimension}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{dim.label}</span>
                  <span className="font-semibold text-indigo-600">
                    {dim.score}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all"
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-bold mb-4">🏢 おすすめ企業</h3>

          <Card>
  <h3 className="text-lg font-bold mb-4">
    💡 あなたにおすすめの理由
  </h3>

  <p className="leading-8 text-gray-700">
    {reason}
  </p>
</Card>

          <div className="space-y-4">
            {companies.map((company) => {
              

              return (
<div key={company.company} className="border rounded-lg p-4">
  <h4 className="font-bold text-lg">
    {company.company}
  </h4>

  <p className="text-sm text-gray-500">
    {company.industry}
  </p>

  <p className="mt-2">
    マッチ度：
    <span className="font-bold text-indigo-600">
      {company.match}%
    </span>
  </p>

  <div className="mt-4 rounded-lg bg-blue-50 p-3">
    <p className="font-semibold text-blue-700">
      ⭐ この企業の魅力
    </p>

    <p className="mt-2 text-gray-700 leading-7">
      {company.strength || "企業情報を準備中です。"}
    </p>
  </div>

  <div className="mt-4 flex gap-3">
    <Link
      href={`/company/${encodeURIComponent(company.company)}`}
      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
    >
      詳細を見る
    </Link>

    <a
      href={company.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline self-center"
    >
      企業サイトを見る
    </a>
  </div>
</div>
              );
            })}
          </div>
        </Card>

        <div className="text-center pt-4">
          <Link href="/diagnosis">
            <Button variant="secondary">もう一度診断する</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
