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

/** AIエントリーシート作成ウィザードの種類。
 *  ガクチカは1本、長所・短所は同じ流れをそれぞれ別に作成する。 */
type WizardVariant = "gakuchika" | "strength" | "weakness";

interface WizardQuestion {
  label: string;
  placeholder: string;
  /** true の場合は一言（1行）入力、false の場合は複数行入力 */
  short: boolean;
}

/** ウィザードの5ステップ定義。
 *  【学生時代に力を入れたことを一言で】→【学んだことを一言で】→
 *  【課題は何だった？】→【それをどう乗り越えた？】→【今後どうしていく？】 */
const WIZARD_CONFIG: Record<
  WizardVariant,
  { fieldId: string; title: string; questions: WizardQuestion[] }
> = {
  gakuchika: {
    fieldId: "gakuchika",
    title: "🤖 AIとガクチカを作る",
    questions: [
      { label: "学生時代に力を入れたことを一言で", placeholder: "例）ゼミでの地域企業の販促プロジェクト", short: true },
      { label: "そこで何を学んだかを一言で", placeholder: "例）仮説と検証を粘り強く繰り返す大切さ", short: true },
      { label: "課題は何だった？", placeholder: "例）SNSの投稿への反応がほとんどなかった", short: false },
      { label: "それをどう乗り越えた？", placeholder: "例）来店客層と投稿内容のズレを分析し、投稿を見直した", short: false },
      { label: "今後どうしていく？", placeholder: "例）現状を分析し、粘り強く改善する姿勢を仕事でも活かしたい", short: false },
    ],
  },
  strength: {
    fieldId: "strengthWeakness",
    title: "🤖 AIと長所を作る",
    questions: [
      { label: "あなたの長所を一言で", placeholder: "例）傾聴力", short: true },
      { label: "その長所が発揮された場面を一言で", placeholder: "例）アルバイトのシフトリーダーとして", short: true },
      { label: "課題は何だった？", placeholder: "例）メンバーの不満が原因で離職が続いていた", short: false },
      { label: "それをどう乗り越えた？", placeholder: "例）一人ひとりから個別に要望を聞き取り、シフトを調整した", short: false },
      { label: "今後どうしていく？", placeholder: "例）お客様や同僚との信頼関係づくりに活かしたい", short: false },
    ],
  },
  weakness: {
    fieldId: "strengthWeakness",
    title: "🤖 AIと短所を作る",
    questions: [
      { label: "あなたの短所を一言で", placeholder: "例）慎重になりすぎて決断が遅い", short: true },
      { label: "その短所が表れた場面を一言で", placeholder: "例）ゼミの発表準備で", short: true },
      { label: "課題は何だった？", placeholder: "例）多角的に考えすぎて判断に時間がかかっていた", short: false },
      { label: "それをどう乗り越えた？（工夫）", placeholder: "例）期限を決め、8割の情報で一度決断するようにした", short: false },
      { label: "今後どうしていく？", placeholder: "例）この工夫を続け、意思決定のスピードを上げたい", short: false },
    ],
  },
};

interface WizardState {
  variant: WizardVariant;
  step: number;
  answers: string[];
  drafting: boolean;
  draft: string | null;
  error: string;
}

/** 既存の「【長所】〜【短所】〜」形式のテキストに、指定ラベルの本文を差し込む。
 *  同じラベルが既にあれば置き換え、無ければ追加する。 */
function mergeStrengthWeakness(
  existing: string,
  label: "長所" | "短所",
  content: string
): string {
  const order: Array<"長所" | "短所"> = ["長所", "短所"];
  const sections: Partial<Record<"長所" | "短所", string>> = {};

  const regex = /【(長所|短所)】([\s\S]*?)(?=【(?:長所|短所)】|$)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(existing))) {
    const key = match[1] as "長所" | "短所";
    const body = match[2].trim();
    if (body) sections[key] = body;
  }

  sections[label] = content.trim();

  return order
    .filter((key) => sections[key])
    .map((key) => `【${key}】${sections[key]}`)
    .join("\n\n");
}

export default function EntrySheetPage() {
  const [answers, setAnswers] = useState<EntrySheetAnswers>({});
  const [saved, setSaved] = useState(false);
  const [wizard, setWizard] = useState<WizardState | null>(null);

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

  // ===== AIエントリーシート作成ウィザード =====

  const openWizard = (variant: WizardVariant) => {
    setWizard({
      variant,
      step: 0,
      answers: ["", "", "", "", ""],
      drafting: false,
      draft: null,
      error: "",
    });
  };

  const closeWizard = () => setWizard(null);

  const updateWizardAnswer = (value: string) => {
    if (!wizard) return;
    const nextAnswers = [...wizard.answers];
    nextAnswers[wizard.step] = value;
    setWizard({ ...wizard, answers: nextAnswers });
  };

  const goPrevStep = () => {
    if (!wizard || wizard.step === 0) return;
    setWizard({ ...wizard, step: wizard.step - 1 });
  };

  const goNextStep = async () => {
    if (!wizard) return;
    const config = WIZARD_CONFIG[wizard.variant];

    if (wizard.step < config.questions.length - 1) {
      setWizard({ ...wizard, step: wizard.step + 1 });
      return;
    }

    // 最終ステップ：AIに文章化してもらう
    setWizard({ ...wizard, drafting: true, error: "" });
    try {
      const res = await fetch("/api/es-wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant: wizard.variant, answers: wizard.answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "作成に失敗しました。");
      setWizard((prev) =>
        prev ? { ...prev, drafting: false, draft: data.draft } : prev
      );
    } catch (e) {
      const message =
        e instanceof Error && e.message ? e.message : "作成に失敗しました。";
      setWizard((prev) => (prev ? { ...prev, drafting: false, error: message } : prev));
    }
  };

  const applyWizardDraft = () => {
    if (!wizard || !wizard.draft) return;
    const config = WIZARD_CONFIG[wizard.variant];
    const field = entrySheetFields.find((f) => f.id === config.fieldId);
    const maxLength = field?.maxLength ?? 400;

    if (wizard.variant === "gakuchika") {
      const current = answers.gakuchika ?? "";
      if (
        current.trim() &&
        !confirm("入力済みの「学生時代に力を入れたこと」をAIの文章で上書きします。よろしいですか？")
      ) {
        return;
      }
      handleChange("gakuchika", wizard.draft.slice(0, maxLength));
    } else {
      const label = wizard.variant === "strength" ? "長所" : "短所";
      const current = answers.strengthWeakness ?? "";
      const merged = mergeStrengthWeakness(current, label, wizard.draft);
      handleChange("strengthWeakness", merged.slice(0, maxLength));
    }

    closeWizard();
  };

  const wizardConfig = wizard ? WIZARD_CONFIG[wizard.variant] : null;
  const wizardQuestion = wizardConfig ? wizardConfig.questions[wizard!.step] : null;
  const wizardAnswer = wizard ? wizard.answers[wizard.step] : "";
  const isLastStep = wizardConfig
    ? wizard!.step === wizardConfig.questions.length - 1
    : false;

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

              {/* AIエントリーシート作成ウィザードの入り口
                  （初心者がぶつかりやすい「書き方が分からない」「ガクチカが思いつかない」への対策） */}
              {field.id === "gakuchika" && (
                <button
                  type="button"
                  onClick={() => openWizard("gakuchika")}
                  className="mt-2 text-sm font-semibold text-[#ff7a1a] hover:underline"
                >
                  🤖 AIと一緒に作る（5つの質問に答えるだけ）
                </button>
              )}
              {field.id === "strengthWeakness" && (
                <div className="mt-2 flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => openWizard("strength")}
                    className="text-sm font-semibold text-[#ff7a1a] hover:underline"
                  >
                    🤖 AIと長所を作る
                  </button>
                  <button
                    type="button"
                    onClick={() => openWizard("weakness")}
                    className="text-sm font-semibold text-[#ff7a1a] hover:underline"
                  >
                    🤖 AIと短所を作る
                  </button>
                </div>
              )}
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

      <div className="text-center mt-6">
        <Link href="/entry-sheet/feedback">
          <Button variant="secondary">💡 フィードバックを見る</Button>
        </Link>
      </div>

      {/* ===== AIエントリーシート作成ウィザード（モーダル） ===== */}
      {wizard && wizardConfig && wizardQuestion && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                {wizardConfig.title}
              </h2>
              <button
                type="button"
                onClick={closeWizard}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                aria-label="閉じる"
              >
                ×
              </button>
            </div>

            {!wizard.draft ? (
              <>
                <div className="text-xs text-gray-400 mb-2">
                  質問 {wizard.step + 1} / {wizardConfig.questions.length}
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5">
                  <div
                    className="bg-[#ff7a1a] h-1.5 rounded-full transition-all"
                    style={{
                      width: `${((wizard.step + 1) / wizardConfig.questions.length) * 100}%`,
                    }}
                  />
                </div>

                <label className="block font-semibold text-gray-800 mb-2">
                  {wizardQuestion.label}
                </label>

                {wizardQuestion.short ? (
                  <input
                    type="text"
                    value={wizardAnswer}
                    onChange={(e) => updateWizardAnswer(e.target.value)}
                    placeholder={wizardQuestion.placeholder}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    autoFocus
                  />
                ) : (
                  <textarea
                    value={wizardAnswer}
                    onChange={(e) => updateWizardAnswer(e.target.value)}
                    placeholder={wizardQuestion.placeholder}
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
                    autoFocus
                  />
                )}

                {wizard.error && (
                  <p className="text-sm text-red-600 mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {wizard.error}
                  </p>
                )}

                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={goPrevStep}
                    disabled={wizard.step === 0 || wizard.drafting}
                  >
                    ← 戻る
                  </Button>
                  <Button
                    onClick={goNextStep}
                    disabled={!wizardAnswer.trim() || wizard.drafting}
                  >
                    {wizard.drafting
                      ? "作成しています..."
                      : isLastStep
                        ? "AIに作成してもらう"
                        : "次へ →"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-2">
                  AIが作成した文章です。内容を確認し、必要であれば反映後に編集してください。
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm leading-6 text-gray-700 whitespace-pre-wrap">
                  {wizard.draft}
                </div>

                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setWizard({
                        variant: wizard.variant,
                        step: 0,
                        answers: ["", "", "", "", ""],
                        drafting: false,
                        draft: null,
                        error: "",
                      })
                    }
                  >
                    やり直す
                  </Button>
                  <Button onClick={applyWizardDraft}>この内容を反映する</Button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
