"use client";

import type { Question, LikertValue } from "@/lib/types";
import { LikertScale } from "./LikertScale";
import { Card } from "../ui/Card";

interface QuestionCardProps {
  question: Question;
  value?: LikertValue;
  onChange: (value: LikertValue) => void;
}

export function QuestionCard({ question, value, onChange }: QuestionCardProps) {
  return (
    <Card className="space-y-6">
      <p className="text-lg sm:text-xl font-semibold text-gray-800 leading-relaxed">
        Q{question.id}. {question.text}
      </p>
      <LikertScale value={value} onChange={onChange} />
    </Card>
  );
}
