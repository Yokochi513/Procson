import Link from "next/link";

const columns = [
  {
    title: "就活支援ツール",
    links: [
      { href: "/diagnosis", label: "自己分析診断" },
      { href: "/entry-sheet", label: "エントリーシート作成" },
      { href: "/interview", label: "AI面接練習" },
    ],
  },
  {
    title: "企業を探す",
    links: [
      { href: "/company", label: "企業一覧" },
      { href: "/result", label: "おすすめ企業" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#0e2149] text-slate-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-3 gap-8">
        <div className="col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-md bg-[#ff7a1a] text-white font-black flex items-center justify-center text-sm">
              N
            </span>
            <span className="text-lg font-black text-white">就活Tool</span>
          </div>
          <p className="text-sm text-slate-400 leading-6">
            自己分析からES作成、面接練習まで。
            <br />
            就活生のための総合サポートサイトです。
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-white font-bold text-sm mb-3">{col.title}</h3>
            <ul className="space-y-2 text-sm">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-[#ff7a1a] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-xs text-slate-400">
          © 2026 就活Tool — 就活生のための自己分析ツール
        </div>
      </div>
    </footer>
  );
}
