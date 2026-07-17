/**
 * AI関連APIの呼び出し先を解決する。
 *
 * NEXT_PUBLIC_API_BASE が設定されていれば外部バックエンド
 * （shuukatu-app-back: ラズパイ上の FastAPI）を叩く。
 * 未設定なら従来どおり同一オリジンの Next.js API Route
 * （basePath 配下）を叩くので、ローカル開発はそのまま動く。
 *
 * 例: NEXT_PUBLIC_API_BASE=https://api.example.com
 *     → apiUrl("/api/interview") === "https://api.example.com/api/interview"
 */
const apiBase = (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/+$/, "");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function apiUrl(path: string): string {
  return apiBase ? `${apiBase}${path}` : `${basePath}${path}`;
}
