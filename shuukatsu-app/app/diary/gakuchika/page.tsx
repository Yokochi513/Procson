import Link from "next/link";
import { DiaryAnalyzer } from "@/components/diary/DiaryAnalyzer";

export default function GakuchikaSeedPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-3">
        <Link
          href="/diary"
          className="text-sm text-gray-400 hover:text-[#ff7a1a] transition-colors"
        >
          ← 日記分析トップへ
        </Link>
      </div>
      <div className="inline-block bg-[#ff7a1a]/10 text-[#ff7a1a] text-xs font-bold px-3 py-1.5 rounded-full mb-3">
        日記分析
      </div>
      <h1 className="text-3xl font-black text-gray-900 mb-2">
        🌱 ガクチカの種さがし
      </h1>
      <p className="text-gray-500 mb-8 leading-7">
        日記に書かれた日常の出来事から、まだ言葉にできていない強みを見つけて、
        ESで使える自己PR・ガクチカの「種」をSTAR形式で言語化します。
        話を盛るのではなく、実際にあった行動に名前をつけることが目的です。
      </p>

      <DiaryAnalyzer mode="gakuchika-seed" analyzeLabel="ガクチカの種を探す" />
    </div>
  );
}
