import { readFile } from "node:fs/promises";
import path from "node:path";
import Papa from "papaparse";
import type { Company } from "@/lib/types";
import { CompanyDetail } from "./CompanyDetail";

// 静的書き出し（output: export）では動的セグメントを事前に列挙する必要がある。
// public/companies.csv をビルド時に読み、掲載企業ぶんのページを生成する。
export async function generateStaticParams() {
  const csvText = await readFile(
    path.join(process.cwd(), "public", "companies.csv"),
    "utf-8"
  );

  const result = Papa.parse<Company>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  return result.data
    .filter((company) => company.company)
    .map((company) => ({ name: company.company }));
}

export default function CompanyDetailPage() {
  return <CompanyDetail />;
}
