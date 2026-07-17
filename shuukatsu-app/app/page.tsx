import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { HeroCarousel } from "@/components/home/HeroCarousel";

/**
 * トップのランディングページ（大手就活サイト風のヒーロー演出）。
 * 「始める」を押すと、通常のホーム画面（/home）に遷移する。
 */
export default function LandingPage() {
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <HeroCarousel />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 py-24">
        <p
          className="hero-fade-in text-white/80 text-xs sm:text-sm font-bold tracking-widest uppercase mb-5"
          style={{ animationDelay: "0.1s" }}
        >
          就活生 累計利用者数 12,000人+
        </p>

        <h1
          className="hero-fade-in text-white text-4xl sm:text-6xl font-black leading-tight mb-6"
          style={{ animationDelay: "0.3s" }}
        >
          あなたの未来が、
          <br />
          ここから始まる。
        </h1>

        <p
          className="hero-fade-in text-white/90 text-base sm:text-xl mb-12"
          style={{ animationDelay: "0.55s" }}
        >
          一人ひとりの就職活動を、全力でサポートします。
        </p>

        <div className="hero-fade-in" style={{ animationDelay: "0.8s" }}>
          <Link href="/home">
            <Button size="lg">始める →</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
