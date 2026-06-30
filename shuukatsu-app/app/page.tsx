import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <section className="max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center">
        <div className="inline-block bg-indigo-100 text-indigo-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          就活生向け 無料診断
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
          あなたに合った
          <span className="text-indigo-600">職種</span>を見つけよう
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          20問の質問に答えるだけで、性格タイプ・強み・向いている職種を分析。
          就活の自己分析に役立つ診断ツールです。
        </p>
        <div className="mt-10">
          <Link href="/diagnosis">
            <Button size="lg">診断を始める →</Button>
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: "📝",
              title: "20問の質問",
              desc: "5段階評価で気軽に回答",
            },
            {
              icon: "🔍",
              title: "自己分析",
              desc: "性格タイプと強みを可視化",
            },
            {
              icon: "🎯",
              title: "職種提案",
              desc: "向いている職種を適性順に表示",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="font-bold text-gray-800">{feature.title}</h3>
              <p className="text-sm text-gray-500 mt-2">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
