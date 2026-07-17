/**
 * AI 処理中などに「動いている」ことを伝えるローディング表示。
 *
 * - Spinner: くるくる回る小さなリング。ボタン内などインラインで使う。
 * - LoadingState: スピナー＋メッセージ＋点滅ドットを組み合わせた、
 *   分析待ち画面用の大きめの表示。
 */

export function Spinner({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={`animate-spin ${className}`}
      style={{ width: size, height: size }}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label="読み込み中"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6V2z"
      />
    </svg>
  );
}

/** 点滅しながら流れる 3 つのドット（「考え中…」の演出） */
export function LoadingDots({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex gap-1 ${className}`} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

/**
 * 分析待ち画面用の大きめのローディング表示。
 * スピナーの下にメッセージと補足を出し、常に動きが見えるようにする。
 */
export function LoadingState({
  message,
  hint,
  className = "",
}: {
  message: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center gap-4 ${className}`}
      role="status"
      aria-live="polite"
    >
      <Spinner size={44} className="text-[#ff7a1a]" />
      <div>
        <p className="text-gray-700 font-semibold flex items-center justify-center gap-2">
          {message}
          <LoadingDots className="text-[#ff7a1a]" />
        </p>
        {hint && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}
      </div>
    </div>
  );
}
