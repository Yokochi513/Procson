import Link from "next/link";
import { Button } from "@/components/ui/Button";

const tools = [
  {
    href: "/diagnosis",
    icon: "📝",
    title: "自己分析診断",
    desc: "20問の質問に答えるだけで、性格タイプ・強みを分析します。",
  },
  {
    href: "/entry-sheet",
    icon: "🖊️",
    title: "エントリーシート作成",
    desc: "自己PR・志望動機・ガクチカを作成し、発表用スライドにも変換できます。",
  },
  {
    href: "/diary",
    icon: "📔",
    title: "日記分析",
    desc: "日記からガクチカの種と面接深掘り質問をAIが発掘します。",
  },
  {
    href: "/interview",
    icon: "🎤",
    title: "AI面接練習",
    desc: "企業別の質問に答えて、スコアとフィードバックを確認。",
  },
  {
    href: "/company",
    icon: "🏢",
    title: "企業を探す",
    desc: "あなたに合った企業をマッチ度順にチェックできます。",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="bg-[#0e2149] text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24 grid sm:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-block bg-[#ff7a1a] text-white text-xs font-bold px-3 py-1.5 rounded-full mb-6">
              就活生向け 総合サポートサイト
            </div>
            <h1 className="text-4xl sm:text-5xl font-black leading-tight">
              自己分析から内定まで、
              <br />
              <span className="text-[#ff7a1a]">就活Tool</span>で丸ごとサポート
            </h1>
            <p className="mt-6 text-slate-300 leading-relaxed">
              自己分析診断・エントリーシート作成・AI面接練習・企業リサーチを
              ひとつのサイトで完結。あなたの就活を最初から最後まで支えます。
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/diagnosis">
                <Button size="lg">無料で診断を始める →</Button>
              </Link>
              <Link href="/company">
                <Button size="lg" variant="secondary">
                  企業を探す
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { num: "12,000+", label: "利用者数" },
              { num: "80社+", label: "掲載企業数" },
              { num: "10問", label: "面接練習の質問" },
              { num: "無料", label: "全機能利用料" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/5 border border-white/10 rounded-xl p-5 text-center"
              >
                <div className="text-2xl font-black text-[#ff7a1a]">
                  {stat.num}
                </div>
                <div className="text-xs text-slate-300 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
            就活Toolでできること
          </h2>
          <p className="text-gray-500 mt-2">5つのツールで就活を効率化</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group bg-white rounded-xl p-6 border border-gray-200 border-t-4 border-t-[#ff7a1a] shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4">{tool.icon}</div>
              <h3 className="font-bold text-gray-900 group-hover:text-[#ff7a1a] transition-colors">
                {tool.title}
              </h3>
              <p className="text-sm text-gray-500 mt-2 leading-6">
                {tool.desc}
              </p>
              <div className="mt-4 text-sm font-bold text-[#0e2149]">
                詳しく見る →
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
