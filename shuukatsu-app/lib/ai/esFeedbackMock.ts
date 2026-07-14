import { EntrySheetAnswers } from "../entrySheet/types";
import { entrySheetFields } from "../entrySheet/fields";

/**
 * ダミーのAIコメント生成（APIキーが無いとき用）。
 * 実際のClaude APIに差し替えても、呼び出し側のインターフェースは変わりません。
 */
export function mockEsFeedback(answers: EntrySheetAnswers): string {
  const filled = entrySheetFields.filter((f) => (answers[f.id] ?? "").trim());

  if (filled.length === 0) {
    return "まだ内容が入力されていません。各項目を埋めてから、もう一度フィードバックを受けてみましょう。";
  }

  const longest = filled.reduce((a, b) =>
    (answers[a.id] ?? "").length >= (answers[b.id] ?? "").length ? a : b
  );

  return [
    `全体を拝見しました。特に「${longest.label}」はよく書き込まれており、あなたの人柄が伝わります。`,
    "さらに良くするために、エピソードには「具体的な数字」や「あなたが取った行動」を一文加えてみましょう。",
    "結論から書き始めると、面接官が要点を掴みやすくなります。応援しています！",
    "",
    "※ これはサンプルのAIコメントです（Claude APIキー未設定）。",
  ].join("\n");
}
