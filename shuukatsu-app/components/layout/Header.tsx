import Link from "next/link";

const navLinks = [
  { href: "/diagnosis", label: "自己分析" },
  { href: "/result", label: "診断結果" },
  { href: "/entry-sheet", label: "エントリーシート" },
  { href: "/interview", label: "面接練習" },
  { href: "/company", label: "企業を探す" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50">
      <div className="bg-[#0e2149] text-white text-xs">
        <div className="max-w-6xl mx-auto px-4 py-1.5 flex justify-end gap-4 text-slate-300">
          <span>就活生 累計利用者数 12,000人+</span>
        </div>
      </div>

      <div className="bg-[#0e2149] border-b-4 border-[#ff7a1a]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-md bg-[#ff7a1a] text-white font-black flex items-center justify-center">
              N
            </span>
            <span className="text-xl font-black text-white tracking-tight">
              就活Tool
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-200">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-md hover:bg-white/10 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/diagnosis"
            className="hidden sm:inline-flex items-center bg-[#ff7a1a] hover:bg-[#f06a08] text-white text-sm font-bold px-4 py-2 rounded-md transition-colors"
          >
            無料診断を始める
          </Link>
        </div>

        <nav className="md:hidden flex overflow-x-auto gap-1 px-4 pb-3 text-sm font-semibold text-slate-200">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
