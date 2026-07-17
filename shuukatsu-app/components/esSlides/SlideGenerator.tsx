"use client";

import { useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockSlidesHtml } from "@/lib/esSlides/mock";
import {
  SlideTheme,
  ThemePresetId,
  buildBrandTheme,
  themePresets,
} from "@/lib/esSlides/theme";
import { entrySheetFields } from "@/lib/entrySheet/fields";
import { loadEntrySheet } from "@/lib/entrySheet/storage";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const placeholder = `例：
【自己PR】
私の強みは、課題を分解して周囲を巻き込みながら解決する力です。
アルバイト先で集計作業の自動化を提案し、作業時間を約6割削減しました。...

【志望動機】
「人に寄り添うものづくり」という貴社の理念に強く共感したからです。...

【学生時代に力を入れたこと】
ゼミで地域コミュニティの情報格差をテーマに研究し、...`;

type ThemeChoice = ThemePresetId | "brand";

/**
 * ESを貼り付け／読み込みして、スキル（.claude/skills/es-slides/）による
 * 就活スライド3枚（①自己紹介②志望動機③自己PR）のHTMLを生成・表示する。
 */
export function SlideGenerator() {
  const [es, setEs] = useState("");
  const [choice, setChoice] = useState<ThemeChoice>("navy");
  const [brandMain, setBrandMain] = useState("#173D63");
  const [brandAccent, setBrandAccent] = useState("#1F7FC0");
  const [html, setHtml] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resolveTheme = (): SlideTheme =>
    choice === "brand"
      ? buildBrandTheme(brandMain, brandAccent)
      : themePresets[choice].theme;

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    setEs(text);
  };

  /** エントリーシート作成ページで保存した内容を読み込む */
  const loadFromEntrySheet = () => {
    const answers = loadEntrySheet();
    const text = entrySheetFields
      .map((f) => {
        const value = (answers[f.id] ?? "").trim();
        return value ? `【${f.label}】\n${value}` : null;
      })
      .filter(Boolean)
      .join("\n\n");
    if (!text) {
      alert(
        "保存されたエントリーシートが見つかりません。先に「エントリーシート作成」ページで入力・保存してください。"
      );
      return;
    }
    setEs(text);
  };

  const generate = async () => {
    if (!es.trim()) return;
    const theme = resolveTheme();
    setLoading(true);
    setHtml(null);
    setSource(null);
    try {
      const res = await fetch(`${basePath}/api/es-slides`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ es, theme }),
      });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      setHtml(data.html);
      setSource(data.source);
    } catch {
      // GitHub Pages などの静的配信では API ルートが無いのでモックを返す。
      setHtml(mockSlidesHtml(theme));
      setSource("mock");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!html) return;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shuukatsu-slides.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Card className="mb-6 border-t-4 border-t-[#ff7a1a]">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          🖊️ エントリーシートを入力する
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          ESの文章（自己PR・志望動機・ガクチカなど）を貼り付けるか、保存済みのエントリーシート／ファイルを読み込んでください。
        </p>

        <textarea
          value={es}
          onChange={(e) => setEs(e.target.value)}
          placeholder={placeholder}
          rows={12}
          className="w-full border border-gray-300 rounded-lg p-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] focus:border-transparent resize-y"
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="secondary" size="sm" onClick={loadFromEntrySheet} disabled={loading}>
            保存済みのエントリーシートを読み込む
          </Button>
          <Button
            variant="outline"
            size="sm"
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
          {es.trim() && (
            <span className="text-xs text-gray-400">{es.length} 文字</span>
          )}
        </div>
      </Card>

      <Card className="mb-6 border-t-4 border-t-[#ff7a1a]">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          🎨 デザインを選ぶ
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          応募先の業界・雰囲気に合わせて配色を選んでください。迷ったらネイビー系がおすすめです。
        </p>

        <div className="grid sm:grid-cols-2 gap-3">
          {(Object.keys(themePresets) as ThemePresetId[]).map((id) => {
            const preset = themePresets[id];
            const selected = choice === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setChoice(id)}
                className={`text-left rounded-lg border-2 p-4 transition-colors cursor-pointer ${
                  selected
                    ? "border-[#ff7a1a] bg-orange-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="inline-block w-4 h-4 rounded-full border border-black/10"
                    style={{ background: preset.theme.navy }}
                  />
                  <span
                    className="inline-block w-4 h-4 rounded-full border border-black/10"
                    style={{ background: preset.theme.blue }}
                  />
                  <span className="font-bold text-sm text-gray-900">
                    {preset.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-5">{preset.desc}</p>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setChoice("brand")}
            className={`text-left rounded-lg border-2 p-4 transition-colors cursor-pointer ${
              choice === "brand"
                ? "border-[#ff7a1a] bg-orange-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="inline-block w-4 h-4 rounded-full border border-black/10"
                style={{ background: brandMain }}
              />
              <span
                className="inline-block w-4 h-4 rounded-full border border-black/10"
                style={{ background: brandAccent }}
              />
              <span className="font-bold text-sm text-gray-900">
                企業ブランドカラー指定
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-5">
              応募先企業のコーポレートカラーに合わせて2色を指定します。
            </p>
          </button>
        </div>

        {choice === "brand" && (
          <div className="mt-4 flex flex-wrap items-center gap-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              メインカラー（見出し）
              <input
                type="color"
                value={brandMain}
                onChange={(e) => setBrandMain(e.target.value)}
                className="w-10 h-8 cursor-pointer border border-gray-300 rounded"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              アクセントカラー（強調）
              <input
                type="color"
                value={brandAccent}
                onChange={(e) => setBrandAccent(e.target.value)}
                className="w-10 h-8 cursor-pointer border border-gray-300 rounded"
              />
            </label>
          </div>
        )}

        <div className="mt-5">
          <Button onClick={generate} disabled={loading || !es.trim()}>
            {loading ? "スライドを生成しています..." : "スライドを生成する"}
          </Button>
        </div>
      </Card>

      {loading && (
        <Card className="mb-6 text-center text-gray-500 text-sm py-10">
          AIがESを読み込んでスライドを組み立てています。しばらくお待ちください...
        </Card>
      )}

      {html && (
        <Card className="mb-6 border-t-4 border-t-[#0e2149]">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900">📊 スライドプレビュー</h2>
            {source && source !== "claude" && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                サンプル表示
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-3">
            「○○大学」などのプレースホルダは、ダウンロード後にご自身の情報へ差し替えてください。
          </p>

          <iframe
            srcDoc={html}
            sandbox=""
            title="就活スライドプレビュー"
            className="w-full h-[75vh] rounded-lg border border-gray-200 bg-[#4a5560]"
          />

          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={download}>HTMLをダウンロード</Button>
            <Button variant="secondary" onClick={generate} disabled={loading}>
              もう一度生成する
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
