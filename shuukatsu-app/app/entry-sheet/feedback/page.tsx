"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { entrySheetFields } from "@/lib/entrySheet/fields";
import { EntrySheetAnswers } from "@/lib/entrySheet/types";
import { loadEntrySheet } from "@/lib/entrySheet/storage";
import { calculateEntrySheetScore, EntrySheetScore } from "@/lib/entrySheet/scoring";
import { generateEntrySheetFeedback } from "@/lib/entrySheet/feedback";
import { InterviewerAvatar } from "@/components/interview/InterviewerAvatar";

const scoreItems: { key: keyof EntrySheetScore; label: string }[] = [
  { key: "volume", label: "分量" },
  { key: "concreteness", label: "具体性" },
  { key: "logic", label: "論理性" },
];

export default function EntrySheetFeedbackPage() {
  const [answers, setAnswers] = useState<EntrySheetAnswers | null>(null);
  const [aiComment, setAiComment] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    setAnswers(loadEntrySheet());
  }, []);

  const requestAiComment = async () => {
    if (!answers) return;
    setAiLoading(true);
    setAiComment(null);
    try {
      const res = await fetch("/api/es-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      setAiComment(data.comment);
    } catch {
      setAiComment("コメントの取得に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setAiLoading(false);
    }
  };

  if (!answers) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-500">
        読み込み中...
      </div>
    );
  }

  const hasContent = entrySheetFields.some((field) =>
    (answers[field.id] ?? "").trim()
  );

  if (!hasContent) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-6">
          まだエントリーシートが作成されていません。
        </p>
        <Link href="/entry-sheet">
          <Button>エントリーシートを作成する</Button>
        </Link>
      </div>
    );
  }

  const score = calculateEntrySheetScore(answers);
  const feedback = generateEntrySheetFeedback(answers, score);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="inline-block bg-[#ff7a1a]/10 text-[#ff7a1a] text-xs font-bold px-3 py-1.5 rounded-full mb-3">
        AIフィードバック
      </div>
      <h1 className="text-3xl font-black text-gray-900 mb-2">
        エントリーシート診断結果
      </h1>
      <p className="text-gray-500 mb-8">
        入力内容をもとに、分量・具体性・論理性を自動で採点しました。
      </p>

      <Card className="mb-6 border-t-4 border-t-[#ff7a1a]">
        <div className="text-center mb-6">
          <div className="text-6xl font-black text-[#0e2149]">
            {score.total}
          </div>
          <div className="text-gray-500 mt-2">総合スコア</div>
        </div>

        <div className="space-y-4">
          {scoreItems.map((item) => (
            <div key={item.key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 font-semibold">{item.label}</span>
                <span className="font-bold text-[#ff7a1a]">{score[item.key]} 点</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#ff7a1a] h-2 rounded-full transition-all"
                  style={{ width: `${score[item.key]}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mb-6 border-t-4 border-t-[#0e2149]">
        <div className="flex items-start gap-4">
          <InterviewerAvatar speaking={aiLoading} size={72} className="shrink-0" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              🤖 AI面接官からのコメント
            </h2>
            {aiComment ? (
              <p className="text-gray-700 whitespace-pre-wrap leading-7 text-sm">
                {aiComment}
              </p>
            ) : (
              <p className="text-gray-500 text-sm mb-3">
                AI面接官があなたのESを読んで、個別のコメントをお伝えします。
              </p>
            )}
            <div className="mt-3">
              <Button onClick={requestAiComment} disabled={aiLoading}>
                {aiLoading
                  ? "考えています..."
                  : aiComment
                    ? "もう一度コメントをもらう"
                    : "AI面接官にコメントをもらう"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          💡 改善アドバイス
        </h2>
        <ul className="space-y-3">
          {feedback.map((item, index) => (
            <li
              key={index}
              className="bg-orange-50 border-l-4 border-[#ff7a1a] p-3 rounded text-gray-700"
            >
              {item}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">入力内容</h2>
        <div className="space-y-5">
          {entrySheetFields.map((field) => (
            <div key={field.id}>
              <h3 className="font-bold text-sm text-[#0e2149] mb-1">
                {field.label}
              </h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap leading-6">
                {answers[field.id] || "（未入力）"}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="text-center pt-8">
        <Link href="/entry-sheet">
          <Button variant="secondary">編集に戻る</Button>
        </Link>
      </div>
    </div>
  );
}
