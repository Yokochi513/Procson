import Link from "next/link";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          キャリア診断
        </Link>
        <nav className="flex gap-4 text-sm text-gray-600">
          <Link href="/diagnosis" className="hover:text-indigo-600">
            診断
          </Link>
          <Link href="/result" className="hover:text-indigo-600">
            結果
          </Link>
        </nav>
      </div>
    </header>
  );
}
