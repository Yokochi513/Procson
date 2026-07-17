import Link from "next/link";
import { DiaryAnalyzer } from "@/components/diary/DiaryAnalyzer";

export default function InterviewDeepdivePage() {
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
        🎯 面接深掘り質問づくり
      </h1>
      <p className="text-gray-500 mb-8 leading-7">
        日記のエピソードをもとに、面接官が実際に投げてくる「深掘り質問」を
        動機・判断・困難・感情・学びの5軸で先回りして作成します。
        模範解答ではなく「質問＋考えるヒント」なので、本番前の予行演習に使ってください。
      </p>

      <DiaryAnalyzer mode="interview-deepdive" analyzeLabel="深掘り質問を作る" />
    </div>
  );
}
