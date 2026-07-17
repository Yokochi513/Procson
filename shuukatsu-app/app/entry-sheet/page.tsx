"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MicButton } from "@/components/ui/MicButton";
import { entrySheetFields } from "@/lib/entrySheet/fields";
import { EntrySheetAnswers } from "@/lib/entrySheet/types";
import {
  loadEntrySheet,
  saveEntrySheet,
  clearEntrySheet,
} from "@/lib/entrySheet/storage";
import { entrySheetTemplate } from "@/lib/entrySheet/templates";

export default function EntrySheetPage() {
  const [answers, setAnswers] = useState<EntrySheetAnswers>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setAnswers(loadEntrySheet());
  }, []);

  const handleChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    saveEntrySheet(answers);
    setSaved(true);
  };

  const handleClear = () => {
    if (!confirm("入力内容をすべて削除しますか？")) return;
    clearEntrySheet();
    setAnswers({});
    setSaved(false);
  };

  /** テスト・記入例用のテンプレートを一括入力する */
  const handleTemplate = () => {
    const hasContent = entrySheetFields.some((f) => (answers[f.id] ?? "").trim());
    if (
      hasContent &&
      !confirm("入力済みの内容をテンプレートで上書きします。よろしいですか？")
    ) {
      return;
    }
    setAnswers({ ...entrySheetTemplate });
    setSaved(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-gray-900 mb-2">
        エントリーシート作成
      </h1>
      <p className="text-gray-500 mb-4">
        項目ごとに入力し、保存できます。内容はブラウザに自動で保存されます。
      </p>

      {/* テスト・記入例用のテンプレート一括入力 */}
      <div className="mb-8 bg-orange-50 border border-orange-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-700">
          📝 書き方に迷ったら、記入例のテンプレートを入れて編集できます。
          <span className="block text-xs text-gray-500 mt-0.5">
            （動作確認用のサンプルとしても使えます）
          </span>
        </p>
        <Button size="sm" variant="secondary" onClick={handleTemplate}>
          テンプレートを入力
        </Button>
      </div>

      <div className="space-y-6">
        {entrySheetFields.map((field) => {
          const value = answers[field.id] ?? "";

          return (
            <Card key={field.id}>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-gray-800">
                  {field.label}
                </h2>
                <div className="flex items-center gap-3">
                  <MicButton
                    onTranscript={(text) =>
                      handleChange(
                        field.id,
                        (value + text).slice(0, field.maxLength)
                      )
                    }
                  />
                  <span className="text-sm text-gray-400">
                    {value.length} / {field.maxLength}
                  </span>
                </div>
              </div>

              <textarea
                value={value}
                onChange={(e) =>
                  handleChange(field.id, e.target.value.slice(0, field.maxLength))
                }
                placeholder={field.placeholder}
                maxLength={field.maxLength}
                rows={6}
                className="w-full border border-gray-200 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </Card>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-8">
        <Button variant="outline" onClick={handleClear}>
          クリア
        </Button>

        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-green-600">保存しました</span>
          )}
          <Button onClick={handleSave}>保存する</Button>
        </div>
      </div>

      <div className="text-center mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/entry-sheet/feedback">
          <Button variant="secondary">💡 フィードバックを見る</Button>
        </Link>
        <Link href="/entry-sheet/slides">
          <Button variant="secondary">📊 スライドを作る</Button>
        </Link>
      </div>
    </div>
  );
}
