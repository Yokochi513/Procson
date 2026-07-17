"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";

/**
 * トップのランディングページ（"/"）だけは、大手就活サイトのヒーロー演出のように
 * 画面いっぱいに表示したいため、共通のHeader/Footerを外す。
 * それ以外のページ（/home 以下）では従来通りHeader/Footerを表示する。
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
