"use client";

import { useEffect, useState } from "react";

/**
 * ヒーローカルーセルの背景画像。
 * public/hero/hero-1.jpg 〜 hero-4.jpg を配置すると表示される。
 * 未配置の間は、そのスライドだけブランドカラーのグラデーションにフォールバックする。
 */
const SLIDES = [
  "/hero/hero-1.jpg",
  "/hero/hero-2.jpg",
  "/hero/hero-3.jpg",
  "/hero/hero-4.jpg",
];

/** 自動再生の間隔（6〜8秒の範囲） */
const AUTOPLAY_MS = 7000;
/** フェード（クロスフェード）の時間（1000〜1500msの範囲） */
const FADE_MS = 1200;

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<boolean[]>(() => SLIDES.map(() => false));

  // 自動再生（ループON）
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, []);

  // 画像の読み込み可否をチェックする。
  // SSRで出力された<img>のonErrorは、ハイドレーション前にリクエストが
  // 失敗しているとハンドラが間に合わず発火しないことがあるため、
  // マウント後に別途 Image() で読み込みを試して判定する。
  useEffect(() => {
    SLIDES.forEach((src, i) => {
      const probe = new window.Image();
      probe.onerror = () => {
        setFailed((prev) => {
          if (prev[i]) return prev;
          const next = [...prev];
          next[i] = true;
          return next;
        });
      };
      probe.src = src;
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0e2149]">
      {SLIDES.map((src, i) => {
        const active = i === index;
        return (
          <div
            key={src}
            className="absolute inset-0"
            style={{
              opacity: active ? 1 : 0,
              transition: `opacity ${FADE_MS}ms ease-in-out`,
            }}
          >
            {failed[i] ? (
              <div className="w-full h-full bg-gradient-to-br from-[#0e2149] via-[#16305f] to-[#0e2149]" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt=""
                onError={() =>
                  setFailed((prev) => {
                    const next = [...prev];
                    next[i] = true;
                    return next;
                  })
                }
                className="w-full h-full object-cover"
                style={{
                  // Ken Burns効果：表示中だけゆっくり拡大し、切り替わったら次回のために即リセットする
                  transform: active ? "scale(1.08)" : "scale(1)",
                  transition: active
                    ? `transform ${AUTOPLAY_MS + FADE_MS}ms ease-out`
                    : "none",
                }}
              />
            )}
          </div>
        );
      })}

      {/* キャッチコピーの視認性を保つための暗いオーバーレイ */}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}
