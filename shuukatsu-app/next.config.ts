import type { NextConfig } from "next";

// GitHub Pages は静的ファイルしか配信できないため、
// STATIC_EXPORT=true のときだけ静的書き出し（out/）でビルドする。
// ローカル開発（npm run dev）やサーバーありの環境では従来どおり動く。
const isStaticExport = process.env.STATIC_EXPORT === "true";

// https://<user>.github.io/Procson/ 配下に置くための接頭辞。
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = isStaticExport
  ? {
      output: "export",
      basePath,
      trailingSlash: true,
      images: { unoptimized: true },
    }
  : {};

export default nextConfig;
