"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { InterviewerPhoto } from "@/components/interview/InterviewerPhoto";
import { MicButton } from "@/components/ui/MicButton";
import {
  EvaluationRadar,
  type Evaluation,
} from "@/components/interview/EvaluationRadar";
import { useSpeechSynthesis } from "@/lib/speech/useSpeechSynthesis";
import { getSampleAnswer } from "@/lib/interview/interviewFlow";

interface ChatMessage {
  role: "interviewer" | "user";
  text: string;
}

type ApiTurn = { role: "assistant" | "user"; content: string };

export default function InterviewChatPage() {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputEnabled, setInputEnabled] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState("");
  const [showSample, setShowSample] = useState(false);
  const [finished, setFinished] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [evalExtra, setEvalExtra] = useState<{
    summary?: string;
    improvements?: string[];
  }>({});
  const [error, setError] = useState("");

  const { speak, isSpeaking, isSupported } = useSpeechSynthesis();

  // messages を API 用の履歴に変換
  const toHistory = (msgs: ChatMessage[]): ApiTurn[] =>
    msgs.map((m) => ({
      role: m.role === "interviewer" ? "assistant" : "user",
      content: m.text,
    }));

  // 面接官の1ターンを取得して表示・読み上げする
  const fetchInterviewerTurn = async (history: ApiTurn[]) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "chat", history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "面接AIエラー");

      const reply: string = data.reply ?? "";
      const category: string = data.category ?? "";
      const isFinished: boolean = Boolean(data.finished);

      setMessages((prev) => [...prev, { role: "interviewer", text: reply }]);
      if (category) setCurrentCategory(category);
      setShowSample(false);
      setLoading(false);

      speak(reply, () => {
        if (isFinished) {
          setFinished(true);
          runEvaluation([
            ...history,
            { role: "assistant", content: reply },
          ]);
        } else {
          setInputEnabled(true);
        }
      });
    } catch (e: any) {
      setLoading(false);
      setError(e.message ?? "エラーが発生しました。");
    }
  };

  // 面接開始（初回1回だけ）
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    fetchInterviewerTurn([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, evaluation, loading]);

  const handleSend = () => {
    if (!inputEnabled || !inputValue.trim()) return;
    const answer = inputValue.trim();
    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", text: answer },
    ];
    setMessages(nextMessages);
    setInputValue("");
    setInputEnabled(false);
    fetchInterviewerTurn(toHistory(nextMessages));
  };

  const runEvaluation = async (history: ApiTurn[]) => {
    setEvaluating(true);
    setError("");
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "evaluate", history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "評価エラー");
      const ev = data.evaluation;
      setEvaluation({
        logical: ev.logical,
        specific: ev.specific,
        passion: ev.passion,
        communication: ev.communication,
        total: ev.total,
      });
      setEvalExtra({ summary: ev.summary, improvements: ev.improvements });
    } catch (e: any) {
      setError(e.message ?? "評価に失敗しました。");
    } finally {
      setEvaluating(false);
    }
  };

  const sample = currentCategory ? getSampleAnswer(currentCategory) : undefined;

  const currentStatus = evaluation
    ? "面接終了・評価完了"
    : evaluating
      ? "面接官が評価しています..."
      : finished
        ? "面接終了"
        : loading
          ? "面接官が考えています..."
          : inputEnabled
            ? "あなたの回答をお待ちしています"
            : isSpeaking
              ? "面接官が話しています..."
              : "進行中...";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* ヘッダー：面接会場の緊迫感を出す濃紺の帯 */}
      <div className="flex items-center gap-4 mb-4 bg-[#0e2149] text-white rounded-xl px-5 py-4">
        <InterviewerPhoto speaking={isSpeaking} size={72} />
        <div>
          <h1 className="text-xl font-black">AI面接</h1>
          <p className="text-sm text-gray-300">{currentStatus}</p>
        </div>
      </div>

      {!isSupported && (
        <p className="text-xs text-orange-600 mb-3">
          お使いのブラウザは音声読み上げに対応していません。テキストのみで進行します。
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* 会話エリア */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 min-h-[45vh] max-h-[55vh] overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[78%] px-4 py-2 rounded-2xl text-sm leading-6 whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-[#0e2149] text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-2xl text-sm">
              面接官が考えています…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 模範解答（学習用・面接官は喋らない） */}
      {sample && !finished && (
        <div className="mt-3">
          <button
            onClick={() => setShowSample((v) => !v)}
            className="text-sm font-semibold text-[#ff7a1a] hover:underline"
          >
            {showSample ? "▲ 模範解答を隠す" : "▼ この質問の模範解答を見る"}
          </button>
          {showSample && (
            <div className="mt-2 bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm leading-6 text-gray-700">
              <div className="font-semibold text-[#0e2149] mb-1">
                模範解答（{sample.label}）
              </div>
              {sample.sampleAnswer}
            </div>
          )}
        </div>
      )}

      {/* 入力エリア */}
      {!finished && (
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
      )}

      {/* 評価結果 */}
      {evaluating && (
        <div className="mt-6 text-center text-gray-500">
          面接官が総合評価を作成しています…
        </div>
      )}

      {evaluation && (
        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">📊 総合評価</h2>
          <EvaluationRadar evaluation={evaluation} />

          {evalExtra.summary && (
            <p className="mt-5 text-sm leading-7 text-gray-700 bg-gray-50 rounded-lg p-4">
              {evalExtra.summary}
            </p>
          )}

          {evalExtra.improvements && evalExtra.improvements.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold text-[#0e2149] mb-2">改善点</h3>
              <ul className="space-y-2">
                {evalExtra.improvements.map((imp, i) => (
                  <li
                    key={i}
                    className="text-sm leading-6 text-gray-700 flex gap-2"
                  >
                    <span className="text-[#ff7a1a] font-bold">
                      {i + 1}.
                    </span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-center mt-6">
            <button
              onClick={() => router.push("/interview")}
              className="px-6 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            >
              面接メニューへ戻る
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
