"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadCompanies } from "@/lib/loadCompanies";
import { loadEntrySheet } from "@/lib/entrySheet/storage";
import { entrySheetFields } from "@/lib/entrySheet/fields";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function InterviewPage() {
  const router = useRouter();

  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [hasEntrySheet, setHasEntrySheet] = useState(false);

  useEffect(() => {
    loadCompanies().then(setCompanies);

    const esAnswers = loadEntrySheet();
    setHasEntrySheet(
      entrySheetFields.some((field) => (esAnswers[field.id] ?? "").trim())
    );
  }, []);

  const startInterview = () => {
    if (!selectedCompany) {
      alert("企業を選択してください。");
      return;
    }

    router.push(
      `/interview/session?company=${encodeURIComponent(selectedCompany)}`
    );
  };

  const startEsInterview = () => {
    if (!hasEntrySheet) {
      alert("先にエントリーシートを作成してください。");
      router.push("/entry-sheet");
      return;
    }

    router.push("/interview/session?source=es");
  };

  const startChatInterview = () => {
    router.push("/interview/chat");
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">

      <h1 className="text-4xl font-black mb-3">
        🎤 バーチャル面接
      </h1>

      <p className="text-gray-600 mb-8">
        面接の練習方法を選択してください。
      </p>

      <Card className="border-t-4 border-t-[#ff7a1a] flex flex-col mb-6">
        <label className="block font-semibold mb-2">
          🗣️ AI面接官と会話形式で面接する
        </label>

        <p className="text-sm text-gray-500 mb-4">
          チャット形式でAI面接官と対話しながら進みます。面接官のセリフは音声でも読み上げられます。
        </p>

        <div>
          <Button onClick={startChatInterview}>AI面接開始</Button>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 gap-6">
        <Card className="border-t-4 border-t-[#ff7a1a] flex flex-col">
          <label className="block font-semibold mb-2">
            企業を選んで面接する
          </label>

          <p className="text-sm text-gray-500 mb-4">
            企業ごとの質問に答えて面接練習ができます。
          </p>

          <select
            value={selectedCompany}
            onChange={(e) =>
              setSelectedCompany(e.target.value)
            }
            className="w-full border rounded-lg p-3"
          >
            <option value="">
              選択してください
            </option>

            {companies.map((company) => (
              <option
                key={company.company}
                value={company.company}
              >
                {company.company}
              </option>
            ))}

          </select>

          <div className="mt-auto pt-6">
            <Button onClick={startInterview} className="w-full">
              面接開始
            </Button>
          </div>
        </Card>

        <Card className="border-t-4 border-t-[#0e2149] flex flex-col">
          <label className="block font-semibold mb-2">
            📄 ESをもとに面接練習をする
          </label>

          <p className="text-sm text-gray-500 mb-4">
            作成したエントリーシートの内容から、深掘り質問を出題します。
          </p>

          {!hasEntrySheet && (
            <p className="text-sm text-orange-600 mb-4">
              まだエントリーシートが作成されていません。
            </p>
          )}

          <div className="mt-auto pt-6">
            <Button
              onClick={startEsInterview}
              variant="secondary"
              className="w-full"
            >
              ES面接を開始
            </Button>
          </div>
        </Card>
      </div>

    </div>
  );
}
