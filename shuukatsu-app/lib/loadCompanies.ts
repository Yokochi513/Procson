import Papa from "papaparse";
import { Company } from "./types";

export async function loadCompanies(): Promise<Company[]> {
  const response = await fetch("/companies.csv");

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