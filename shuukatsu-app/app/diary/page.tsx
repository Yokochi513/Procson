import Link from "next/link";

const analyses = [
  {
    href: "/diary/gakuchika",
    icon: "🌱",
    title: "ガクチカの種さがし",
    desc: "日記に埋もれた強みを見つけて、ES（エントリーシート）で使える自己PR・ガクチカの種をSTAR形式で言語化します。",
    points: [
      "強みラベル＋日記からの根拠を提示",
      "STAR形式（状況・課題・行動・結果）で整理",
      "ESの冒頭に使える1文サンプル付き",
    ],
  },
  {
    href: "/diary/interview",
    icon: "🎯",
    title: "面接深掘り質問づくり",
    desc: "日記のエピソードをもとに、面接官が実際に投げてくる「深掘り質問」を先回りで作成。本番前の予行演習に使えます。",
    points: [
      "動機・判断・困難・感情・学びの5軸で質問化",
      "答えを考えるためのヒント付き",
      "特に練習すべき質問トップ3を選定",
    ],
  },
];

export default function DiaryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="inline-block bg-[#ff7a1a]/10 text-[#ff7a1a] text-xs font-bold px-3 py-1.5 rounded-full mb-3">
        日記分析
      </div>
      <h1 className="text-3xl font-black text-gray-900 mb-2">
        日記から就活の武器をつくる
      </h1>
      <p className="text-gray-500 mb-10 leading-7">
        毎日の何気ない記録には、ESや面接で使えるエピソードが眠っています。
        日記を貼り付けるだけで、AIが2つの角度から分析します。
      </p>

      <div className="grid sm:grid-cols-2 gap-6">
        {analyses.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group bg-white rounded-xl p-6 border border-gray-200 border-t-4 border-t-[#ff7a1a] shadow-sm hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="text-4xl mb-4">{item.icon}</div>
            <h2 className="text-lg font-bold text-gray-900 group-hover:text-[#ff7a1a] transition-colors">
              {item.title}
            </h2>
            <p className="text-sm text-gray-500 mt-2 leading-6">{item.desc}</p>
            <ul className="mt-4 space-y-1.5 text-xs text-gray-600 flex-1">
              {item.points.map((point) => (
                <li key={point} className="flex gap-1.5">
                  <span className="text-[#ff7a1a] font-bold">✓</span>
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-5 text-sm font-bold text-[#0e2149]">
              分析を始める →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
