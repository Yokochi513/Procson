"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { InterviewerAvatar } from "@/components/interview/InterviewerAvatar";
import { MicButton } from "@/components/ui/MicButton";
import { useSpeechSynthesis } from "@/lib/speech/useSpeechSynthesis";
import { buildChatScript, ChatStep } from "@/lib/interview/chatScript";

interface ChatMessage {
  role: "interviewer" | "user";
  text: string;
}

export default function InterviewChatPage() {
  const router = useRouter();
  const script = useRef<ChatStep[]>(buildChatScript()).current;
  const processedIndex = useRef(-1);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [stepIndex, setStepIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputEnabled, setInputEnabled] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [finished, setFinished] = useState(false);

  const { speak, isSpeaking, isSupported } = useSpeechSynthesis();

  useEffect(() => {
    if (processedIndex.current === stepIndex) return;
    processedIndex.current = stepIndex;

    if (stepIndex >= script.length) {
      setFinished(true);
      return;
    }

    const step = script[stepIndex];
    setMessages((prev) => [...prev, { role: "interviewer", text: step.text }]);
    setInputEnabled(false);

    speak(step.text, () => {
      if (step.type === "ask") {
        setInputEnabled(true);
      } else {
        setStepIndex((i) => i + 1);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputEnabled || !inputValue.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: inputValue.trim() }]);
    setInputValue("");
    setInputEnabled(false);
    setStepIndex((i) => i + 1);
  };

  const currentStatus = finished
    ? "面接終了"
    : inputEnabled
      ? "あなたの回答をお待ちしています"
      : isSpeaking
        ? "面接官が話しています..."
        : "進行中...";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col h-[calc(100vh-140px)]">
      <div className="flex items-center gap-4 mb-4">
        <InterviewerAvatar speaking={isSpeaking} size={72} className="shrink-0" />
        <div>
          <h1 className="text-xl font-black text-gray-900">AI面接</h1>
          <p className="text-sm text-gray-500">{currentStatus}</p>
        </div>
      </div>

      {!isSupported && (
        <p className="text-xs text-orange-600 mb-3">
          お使いのブラウザは音声読み上げに対応していません。テキストのみで進行します。
        </p>
      )}

      <div className="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-6 ${
                m.role === "user"
                  ? "bg-[#0e2149] text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          disabled={!inputEnabled}
          placeholder={
            inputEnabled
              ? "回答を入力してください"
              : "面接官の発言をお待ちください..."
          }
          className="flex-1 border rounded-lg px-4 py-3 disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />

        {inputEnabled && (
          <MicButton onTranscript={(text) => setInputValue((v) => v + text)} />
        )}

        <button
          onClick={handleSend}
          disabled={!inputEnabled || !inputValue.trim()}
          className="px-6 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          送信
        </button>
      </div>

      {finished && (
        <div className="text-center mt-4">
          <button
            onClick={() => router.push("/interview")}
            className="px-6 py-3 rounded-lg border font-semibold"
          >
            面接メニューへ戻る
          </button>
        </div>
      )}
    </div>
  );
}
