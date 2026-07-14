"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { loadCompanies } from "@/lib/loadCompanies";
import type { Company } from "@/lib/types";

export function CompanyDetail() {
  const params = useParams();

  const companyName = decodeURIComponent(
    params.name as string
  );

  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    loadCompanies().then((companies) => {
      const found = companies.find(
        (c) => c.company === companyName
      );

      if (found) {
        setCompany(found);
      }
    });
  }, [companyName]);

  if (!company) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <p>企業が見つかりませんでした。</p>

        <Link
          href="/company"
          className="text-blue-600 underline"
        >
          ← 一覧へ戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">

      <Link
        href="/company"
        className="text-blue-600 underline"
      >
        ← 企業一覧へ戻る
      </Link>

      <h1 className="text-4xl font-bold mt-6">
        {company.company}
      </h1>

      <p className="text-gray-500 mt-2">
        {company.industry}
      </p>

      <div className="mt-8 border rounded-xl p-6">

        <h2 className="text-2xl font-bold mb-4">
          ⭐ この企業の魅力
        </h2>

        <p className="leading-8">
          {company.strength}
        </p>

      </div>

      <div className="mt-8 border rounded-xl p-6">

        <h2 className="text-2xl font-bold mb-4">
          能力バランス
        </h2>

        <div className="space-y-4">

          <div>
            リーダーシップ：{company.leadership}
          </div>

          <div>
            コミュニケーション：{company.communication}
          </div>

          <div>
            論理的思考：{company.logical}
          </div>

          <div>
            創造力：{company.creativity}
          </div>

          <div>
            実行力：{company.execution}
          </div>

        </div>

      </div>

      <div className="mt-8">

        <a
          href={company.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600"
        >
          公式サイトを見る
        </a>

      </div>

    </div>
  );
}
