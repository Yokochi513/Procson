/**
 * GitHub Pages 向け静的書き出し（STATIC_EXPORT=true）専用のビルドラッパー。
 *
 * app/api/ 配下の Route Handler はすべて動的な POST（Request を読む）で、
 * Next.js の `output: export` はこれらを同梱できずビルドに失敗する。
 * これらのルートはローカル開発（npm run dev）専用で、静的サイトからは
 * 外部バックエンド（NEXT_PUBLIC_API_BASE=shuukatu-app-back）を叩くため不要。
 *
 * そこでビルド中だけ app/api を退避し、終わったら必ず元に戻す。
 * Windows / Linux どちらでも動くよう、next バイナリは node で直接起動する。
 */
import { rename, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const apiDir = path.join(root, "app", "api");
const stashDir = path.join(root, ".api-stash");
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");

const hasApi = existsSync(apiDir);

if (hasApi) {
  await rm(stashDir, { recursive: true, force: true });
  await rename(apiDir, stashDir);
}

let status = 0;
try {
  const result = spawnSync(process.execPath, [nextBin, "build"], {
    stdio: "inherit",
    env: process.env,
  });
  status = result.status ?? 1;
} finally {
  if (hasApi) {
    await rm(apiDir, { recursive: true, force: true });
    await rename(stashDir, apiDir);
  }
}

process.exit(status);
