"use client";

import { useSpeechRecognition } from "@/lib/speech/useSpeechRecognition";

interface Props {
  onTranscript: (text: string) => void;
  className?: string;
}

/**
 * 音声入力ボタン。ブラウザが対応していない場合は何も表示しません。
 */
export function MicButton({ onTranscript, className = "" }: Props) {
  const { isListening, isSupported, start, stop } =
    useSpeechRecognition(onTranscript);

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={() => (isListening ? stop() : start())}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
        isListening
          ? "bg-red-500 text-white border-red-500 animate-pulse"
          : "bg-white text-[#0e2149] border-gray-300 hover:bg-gray-50"
      } ${className}`}
    >
      {isListening ? "🔴 停止" : "🎤 音声入力"}
    </button>
  );
}
