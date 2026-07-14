"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getQuestions } from "@/lib/interview/questions";
import { getQuestionsFromEntrySheet } from "@/lib/interview/esQuestions";
import { calculateScore } from "@/lib/interview/scoring";
import { generateFeedback } from "@/lib/interview/feedback";
import { saveInterviewResult } from "@/lib/interview/storage";
import { loadEntrySheet } from "@/lib/entrySheet/storage";
import type { InterviewAnswer } from "@/lib/interview/types";
import QuestionCard from "@/lib/interview/QuestionCard";
import AnswerBox from "@/lib/interview/AnswerBox";
import ProgressBar from "@/lib/interview/ProgressBar";
import { InterviewerAvatar } from "@/components/interview/InterviewerAvatar";

export default function InterviewSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEsMode = searchParams.get("source") === "es";
  const company = searchParams.get("company") ?? "";
  const label = isEsMode ? "ESをもとにした面接" : company;

  const questions = useMemo(
    () =>
      isEsMode
        ? getQuestionsFromEntrySheet(loadEntrySheet())
        : getQuestions(company),
    [isEsMode, company]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion
    ? answers.find((a) => a.questionId === currentQuestion.id)?.answer ?? ""
    : "";

  const isLast = currentIndex === questions.length - 1;

  const handleChange = (value: string) => {
    setAnswers((prev) => [
      ...prev.filter((a) => a.questionId !== currentQuestion.id),
      {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        category: currentQuestion.category,
        answer: value,
      },
    ]);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleNext = () => {
    if (!currentAnswer.trim()) {
      alert("回答を入力してください。");
      return;
    }

    if (!isLast) {
      setCurrentIndex((i) => i + 1);
      return;
    }

    const score = calculateScore(answers);
    const feedback = generateFeedback(answers, score);

    saveInterviewResult({
      company: label,
      date: new Date().toISOString(),
      answers,
      score,
      feedback,
    });

    router.push("/interview/result");
  };

  if (questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-6 text-center">
        <p className="text-gray-500 mb-6">
          エントリーシートが未作成のため、質問を作成できませんでした。
        </p>
        <button
          onClick={() => router.push("/entry-sheet")}
          className="px-6 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold"
        >
          エントリーシートを作成する
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-2">🎤 バーチャル面接</h1>

      <p className="text-gray-500 mb-8">{label}</p>

      <ProgressBar current={currentIndex + 1} total={questions.length} />

      <div className="mt-8 space-y-6">
        <div className="flex items-center gap-4">
          <InterviewerAvatar size={80} className="shrink-0" />
          <p className="text-sm text-gray-500">
            AI面接官が質問します。落ち着いて回答しましょう。
          </p>
        </div>

        <QuestionCard
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          category={currentQuestion.category}
          question={currentQuestion.question}
        />

        <AnswerBox value={currentAnswer} onChange={handleChange} />
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-6 py-3 rounded-lg border font-semibold disabled:opacity-40"
        >
          ← 前へ
        </button>

        <button
          onClick={handleNext}
          className="px-6 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold"
        >
          {isLast ? "結果を見る →" : "次へ →"}
        </button>
      </div>
    </div>
  );
}
