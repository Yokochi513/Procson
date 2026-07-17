import Link from "next/link";
import { SlideGenerator } from "@/components/esSlides/SlideGenerator";

export default function EsSlidesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-3">
        <Link
          href="/entry-sheet"
          className="text-sm text-gray-400 hover:text-[#ff7a1a] transition-colors"
        >
          ← エントリーシート作成へ
        </Link>
      </div>
      <div className="inline-block bg-[#ff7a1a]/10 text-[#ff7a1a] text-xs font-bold px-3 py-1.5 rounded-full mb-3">
        ES活用
      </div>
      <h1 className="text-3xl font-black text-gray-900 mb-2">
        📊 ESから就活スライドをつくる
      </h1>
      <p className="text-gray-500 mb-8 leading-7">
        エントリーシートの文章をもとに、面接・グループ選考で使える
        「①自己紹介 ②志望動機 ③自己PR」の3枚のスライドをAIが自動作成します。
        長文のESを「主張＋短い補足」に圧縮した、見せるための資料に変換します。
      </p>

      <SlideGenerator />
    </div>
  );
}
