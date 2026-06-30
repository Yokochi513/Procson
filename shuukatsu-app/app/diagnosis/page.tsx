"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import questions from "@/data/questions.json";
import type { Answer, LikertValue, Question } from "@/lib/types";
import { QuestionCard } from "@/components/diagnosis/QuestionCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { analyzeAnswers } from "@/lib/scoring";
import { saveAnswers, saveResult } from "@/lib/storage";

export default function DiagnosisPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const currentQuestion = (questions as Question[])[currentIndex];
  const currentAnswer = answers.find(
    (a) => a.questionId === currentQuestion.id
  )?.value;

  const handleAnswer = (value: LikertValue) => {
    const updated = [
      ...answers.filter((a) => a.questionId !== currentQuestion.id),
      { questionId: currentQuestion.id, value },
    ];
    setAnswers(updated);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleSubmit = () => {
    if (answers.length < questions.length) {
      alert("すべての質問に回答してください");
      return;
    }
    const result = analyzeAnswers(answers);
    saveAnswers(answers);
    saveResult(result);
    router.push("/result");
  };

  const isLast = currentIndex === questions.length - 1;
  const allAnswered = answers.length === questions.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">キャリア診断</h1>
      <p className="text-gray-500 mb-8">
        直感で答えてください。正解・不正解はありません。
      </p>

      <ProgressBar current={currentIndex + 1} total={questions.length} />

      <div className="mt-8">
        <QuestionCard
          question={currentQuestion}
          value={currentAnswer}
          onChange={handleAnswer}
        />
      </div>

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          ← 前へ
        </Button>

        {isLast ? (
          <Button onClick={handleSubmit} disabled={!allAnswered}>
            結果を見る →
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={!currentAnswer}>
            次へ →
          </Button>
        )}
      </div>
    </div>
  );
}
