"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * ブラウザ標準の Web Speech API（音声読み上げ）を使うフック。
 * 追加のAPIキーや課金は不要。
 *
 * isSupported は「未判定」を表す null から始める。
 * render 中に typeof window で分岐すると、サーバー(false)とクライアント(true)で
 * 出力がズレて hydration mismatch になるため、判定は必ず useEffect 内で行う。
 */
export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  /** null = 未判定（SSR時・初回render）／true・false = 判定済み */
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  useEffect(() => {
    // ブラウザ機能の判定はマウント後に行う必要があるため、
    // ここでの setState は hydration mismatch を避けるための意図的なもの。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSupported("speechSynthesis" in window);
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    // state ではなく実体を直接見る（未判定の段階で呼ばれても正しく動くように）
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      onEnd?.();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  return { speak, isSpeaking, isSupported };
}
