import Papa from "papaparse";
import { Company } from "./types";

// GitHub Pages ではサブパス配信になるため、public/ の取得にも接頭辞が要る。
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export async function loadCompanies(): Promise<Company[]> {
  const response = await fetch(`${basePath}/companies.csv`);

  const csvText = await response.text();

  const result = Papa.parse<Company>(
    csvText,
    {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    }
  );

  return result.data;
}
