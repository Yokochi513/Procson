import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "就活Tool | 自己分析・ES・面接対策の総合就活サイト",
  description: "自己分析診断、エントリーシート作成、AI面接練習まで。就活生のための総合サポートサイトです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 font-sans">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
