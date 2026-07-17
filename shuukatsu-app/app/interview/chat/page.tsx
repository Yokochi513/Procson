"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { InterviewerPhoto } from "@/components/interview/InterviewerPhoto";
import { MicButton } from "@/components/ui/MicButton";
import {
  EvaluationRadar,
  type Evaluation,
} from "@/components/interview/EvaluationRadar";
import { useSpeechSynthesis } from "@/lib/speech/useSpeechSynthesis";
import { getSampleAnswer } from "@/lib/interview/interviewFlow";
import { loadCompanies } from "@/lib/loadCompanies";
import { loadEntrySheet } from "@/lib/entrySheet/storage";
import { entrySheetFields } from "@/lib/entrySheet/fields";
import type { EntrySheetAnswers } from "@/lib/entrySheet/types";
import { apiUrl } from "@/lib/ai/apiBase";

interface ChatMessage {
  role: "interviewer" | "user";
  text: string;
}

type ApiTurn = { role: "assistant" | "user"; content: string };

interface CompanyContext {
  company: string;
  industry?: string;
  strength?: string;
}

/** エラーオブジェクトからメッセージを取り出す */
function errorMessage(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback;
}

export default function InterviewChatPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-500">
          読み込み中...
        </div>
      }
    >
      <InterviewChat />
    </Suspense>
  );
}

function InterviewChat() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyName = searchParams.get("company") ?? "";
  const isEsMode = searchParams.get("source") === "es";

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
  /** ES面接なのにESが空だった場合の注意表示 */
  const [esEmpty, setEsEmpty] = useState(false);

  // 面接の文脈（企業情報 / ES）。非同期処理から参照するため ref に保持する。
  const contextRef = useRef<{
    company: CompanyContext | null;
    esAnswers: EntrySheetAnswers | null;
  }>({ company: null, esAnswers: null });

  const { speak, isSpeaking, isSupported } = useSpeechSynthesis();

  const toHistory = (msgs: ChatMessage[]): ApiTurn[] =>
    msgs.map((m) => ({
      role: m.role === "interviewer" ? "assistant" : "user",
      content: m.text,
    }));

  /** 面接終了後、やり取り全体を評価する */
  const runEvaluation = async (history: ApiTurn[]) => {
    setEvaluating(true);
    setError("");
    try {
      const res = await fetch(apiUrl("/api/interview"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "evaluate",
          history,
          company: contextRef.current.company,
        }),
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
    } catch (e: unknown) {
      setError(errorMessage(e, "評価に失敗しました。"));
    } finally {
      setEvaluating(false);
    }
  };

  /** 面接官の1ターンを取得して表示・読み上げする */
  const fetchInterviewerTurn = async (history: ApiTurn[]) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(apiUrl("/api/interview"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "chat",
          history,
          company: contextRef.current.company,
          esAnswers: contextRef.current.esAnswers,
        }),
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
          runEvaluation([...history, { role: "assistant", content: reply }]);
        } else {
          setInputEnabled(true);
        }
      });
    } catch (e: unknown) {
      setLoading(false);
      setError(errorMessage(e, "エラーが発生しました。"));
    }
  };

  // 文脈（企業情報・ES）を読み込んでから面接開始（初回1回だけ）
  useEffect(() => {
    if (started.current) return;
    started.current = true;

    (async () => {
      if (isEsMode) {
        const es = loadEntrySheet();
        contextRef.current.esAnswers = es;
        setEsEmpty(
          !entrySheetFields.some((f) => (es[f.id] ?? "").trim())
        );
      }

      if (companyName) {
        try {
          const companies = await loadCompanies();
          const hit = companies.find((c) => c.company === companyName);
          contextRef.current.company = hit
            ? {
                company: hit.company,
                industry: hit.industry,
                strength: hit.strength,
              }
            : { company: companyName };
        } catch {
          contextRef.current.company = { company: companyName };
        }
      }

      fetchInterviewerTurn([]);
    })();
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

  const sample = currentCategory ? getSampleAnswer(currentCategory) : undefined;

  // 面接の種類ラベル
  const modeLabel = companyName
    ? `${companyName} 面接`
    : isEsMode
      ? "ESをもとにした面接"
      : "AI面接";

  const latestInterviewerLine =
    [...messages].reverse().find((m) => m.role === "interviewer")?.text ?? "";

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
      {/* ===== 面接会場：面接官の写真を中央に大きく配置 ===== */}
      <div className="relative bg-gradient-to-b from-[#0b1a3a] to-[#0e2149] rounded-2xl px-6 py-8 mb-4 overflow-hidden">
        {/* スポットライト風の演出で緊迫感を出す */}
        <div
          className="absolute inset-x-0 top-0 h-40 opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.25), transparent 70%)",
          }}
        />

        <div className="relative flex flex-col items-center text-center">
          <span className="text-[11px] tracking-widest text-orange-300 font-bold mb-3">
            {modeLabel}
          </span>

          {/* 面接官の写真（画面中央） */}
          <InterviewerPhoto speaking={isSpeaking} size={176} />

          <p className="mt-4 text-white font-bold text-lg">面接官</p>
          <p className="text-xs text-gray-300 mt-0.5">{currentStatus}</p>

          {/* 面接官の最新の発言（写真の真下） */}
          {latestInterviewerLine && !evaluation && (
            <div className="mt-5 w-full max-w-md bg-white/95 text-gray-800 rounded-2xl px-5 py-4 text-sm leading-7 whitespace-pre-wrap shadow-lg">
              {latestInterviewerLine}
            </div>
          )}

          {loading && !latestInterviewerLine && (
            <div className="mt-5 text-sm text-gray-300">
              面接官が考えています…
            </div>
          )}
        </div>
      </div>

      {/* isSupported === null は「未判定」。SSRとクライアントの初回renderを
          一致させるため、非対応が確定したときだけ表示する。 */}
      {isSupported === false && (
        <p className="text-xs text-orange-600 mb-3">
          お使いのブラウザは音声読み上げに対応していません。テキストのみで進行します。
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {isEsMode && esEmpty && (
        <p className="text-sm text-orange-700 mb-3 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
          エントリーシートが未入力のため、一般的な質問で進行します。
        </p>
      )}

      {/* ===== 会話ログ ===== */}
      <details className="mb-3" open>
        <summary className="cursor-pointer text-sm font-semibold text-[#0e2149] mb-2">
          会話ログ
        </summary>
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 max-h-64 overflow-y-auto">
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
          <div ref={bottomRef} />
        </div>
      </details>

      {/* ===== 模範解答（学習用・面接官は喋らない） ===== */}
      {sample && !finished && (
        <div className="mb-3">
          <button
            onClick={() => setShowSample((v) => !v)}
            className="text-sm font-semibold text-[#ff7a1a] hover:underline cursor-pointer"
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

      {/* ===== 入力エリア ===== */}
      {!finished && (
        <div className="flex items-center gap-2">
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
            className="px-6 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            送信
          </button>
        </div>
      )}

      {/* ===== 評価結果 ===== */}
      {evaluating && (
        <div className="mt-6 text-center text-gray-500">
          面接官が総合評価を作成しています…
        </div>
      )}

      {evaluation && (
        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-1">📊 総合評価</h2>
          <p className="text-sm text-gray-500 mb-4">{modeLabel}</p>
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
                    <span className="text-[#ff7a1a] font-bold">{i + 1}.</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-center mt-6">
            <button
              onClick={() => router.push("/interview")}
              className="px-6 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold cursor-pointer"
            >
              面接メニューへ戻る
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
