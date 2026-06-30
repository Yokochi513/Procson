"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { loadCompanies } from "@/lib/loadCompanies";
import { Company } from "@/lib/types";

export default function CompanyDetailPage() {
  const params = useParams();

  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    async function fetchCompany() {
      const companies = await loadCompanies();

      const found = companies.find(
        (c) => c.company === decodeURIComponent(params.name as string)
      );

      if (found) {
        setCompany(found);
      }
    }

    fetchCompany();
  }, [params]);

  if (!company) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-2xl font-bold">
          企業が見つかりません
        </h1>

        <Link href="/company">
          <button className="mt-6 rounded bg-blue-600 px-5 py-2 text-white">
            一覧へ戻る
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">

      <h1 className="text-4xl font-bold mb-3">
        {company.company}
      </h1>

      <p className="text-lg text-gray-600 mb-8">
        {company.industry}
      </p>

      <div className="rounded-xl border p-6">

        <h2 className="font-bold text-xl mb-4">
          能力バランス
        </h2>

        <ul className="space-y-2">

          <li>Leadership：{company.leadership}</li>

          <li>Communication：{company.communication}</li>

          <li>Logical：{company.logical}</li>

          <li>Creativity：{company.creativity}</li>

          <li>Execution：{company.execution}</li>

        </ul>

      </div>

      <a
        href={company.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-8 rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700"
      >
        🌐 公式サイトを見る
      </a>

      <div>

        <Link href="/company">
          <button className="mt-6 rounded bg-gray-700 px-5 py-2 text-white">
            ← 一覧へ戻る
          </button>
        </Link>

      </div>

    </div>
  );
}