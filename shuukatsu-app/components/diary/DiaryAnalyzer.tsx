"use client";

import { useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MarkdownView } from "@/components/diary/MarkdownView";
import { mockDiaryAnalysis } from "@/lib/diary/mock";
import { DiaryAnalysisMode } from "@/lib/diary/types";
import { apiUrl } from "@/lib/ai/apiBase";

const placeholder = `例：
## Day1（4月8日）
バイトの初出勤。レジ操作を覚えるのに必死だった。

## Day5（4月15日）
サークルの新歓の企画係を任された。何から手をつけるか迷った。
...`;

/**
 * 日記を貼り付け／アップロードして、スキル（.claude/skills/）による
 * 分析結果を表示する共通コンポーネント。
 */
export function DiaryAnalyzer({
  mode,
  analyzeLabel,
}: {
  mode: DiaryAnalysisMode;
  analyzeLabel: string;
}) {
  const [diary, setDiary] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    setDiary(text);
  };

  const analyze = async () => {
    if (!diary.trim()) return;
    setLoading(true);
    setResult(null);
    setSource(null);
    try {
      const res = await fetch(apiUrl("/api/diary-analysis"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diary, mode }),
      });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      setResult(data.result);
      setSource(data.source);
    } catch {
      // GitHub Pages などの静的配信では API ルートが無いのでモックを返す。
      setResult(mockDiaryAnalysis(mode));
      setSource("mock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card className="mb-6 border-t-4 border-t-[#ff7a1a]">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          📔 日記を入力する
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          日付ごとに区切られた日記（Markdown・テキスト）を貼り付けるか、ファイルを選択してください。
        </p>

        <textarea
          value={diary}
          onChange={(e) => setDiary(e.target.value)}
          placeholder={placeholder}
          rows={12}
          className="w-full border border-gray-300 rounded-lg p-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] focus:border-transparent resize-y"
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={analyze} disabled={loading || !diary.trim()}>
            {loading ? "分析しています..." : analyzeLabel}
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            ファイルを選択（.md / .txt）
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.txt,.markdown,text/plain,text/markdown"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {diary.trim() && (
            <span className="text-xs text-gray-400">
              {diary.length} 文字
            </span>
          )}
        </div>
      </Card>

      {loading && (
        <Card className="mb-6 text-center text-gray-500 text-sm py-10">
          AIが日記を読み込んで分析しています。しばらくお待ちください...
        </Card>
      )}

      {result && (
        <Card className="mb-6 border-t-4 border-t-[#0e2149]">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900">🔍 分析結果</h2>
            {source && source !== "claude" && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                サンプル表示
              </span>
            )}
          </div>
          <MarkdownView markdown={result} />
          <div className="mt-6">
            <Button variant="secondary" onClick={analyze} disabled={loading}>
              もう一度分析する
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
