"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadInterviewHistory } from "@/lib/interview/storage";
import type { InterviewResult } from "@/lib/interview/types";
import ScoreCard from "@/lib/interview/ScoreCard";
import FeedbackCard from "@/lib/interview/FeedbackCard";

export default function InterviewResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<InterviewResult | null>(null);

  useEffect(() => {
    const history = loadInterviewHistory();

    if (history.length === 0) {
      router.push("/interview");
      return;
    }

    setResult(history[0]);
  }, [router]);

  if (!result) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-500">
        読み込み中...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-6 space-y-6">
      <h1 className="text-3xl font-bold mb-2">面接結果</h1>
      <p className="text-gray-500 mb-6">{result.company}</p>

      <ScoreCard
        total={result.score.total}
        logical={result.score.logical}
        specific={result.score.specific}
        passion={result.score.passion}
        communication={result.score.communication}
      />

      <FeedbackCard feedback={result.feedback} />

      <div className="text-center pt-4">
        <Link
          href="/interview"
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold"
        >
          もう一度面接する
        </Link>
      </div>
    </div>
  );
}
