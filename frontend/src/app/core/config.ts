// バックエンドのベースURL。開発時は Express(:3000) を直接叩く（BE 側で CORS 許可済み）。
export const API_BASE = 'http://localhost:3000';

// 相対パス（/storage/...）を画像表示用の絶対URLへ変換
export function assetUrl(pathOrNull: string | null | undefined): string | null {
  if (!pathOrNull) return null;
  return pathOrNull.startsWith('http') ? pathOrNull : `${API_BASE}${pathOrNull}`;
}
