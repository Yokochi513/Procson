"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadCompanies } from "@/lib/loadCompanies";

export default function CompanyPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    loadCompanies().then(setCompanies);
  }, []);

  const filtered = companies.filter((c) =>
    c.company.toLowerCase().includes(keyword.toLowerCase()) ||
    c.industry.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-6">
        企業検索
      </h1>

      <input
        className="border rounded-lg p-3 w-full mb-6"
        placeholder="企業名・業界を検索"
        value={keyword}
        onChange={(e)=>setKeyword(e.target.value)}
      />

      <div className="grid gap-5">

        {filtered.map((company)=>(
          <div
            key={company.company}
            className="border rounded-xl p-5"
          >

            <h2 className="font-bold text-xl">
              {company.company}
            </h2>

            <p>{company.industry}</p>

            <Link
              href={`/company/${encodeURIComponent(company.company)}`}
            >
              <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded">
                詳細を見る
              </button>
            </Link>

          </div>
        ))}

      </div>

    </div>
  );
}