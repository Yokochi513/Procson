/**
 * Anthropic APIキーを取得する。
 *
 * このプロジェクトの .env は `api_key=sk-ant-...` という名前で保存されているため、
 * SDK 既定の ANTHROPIC_API_KEY だけでなく api_key も参照する。
 * （サーバー側でのみ使用すること）
 */
export function getApiKey(): string | undefined {
  return process.env.ANTHROPIC_API_KEY ?? process.env.api_key;
}
