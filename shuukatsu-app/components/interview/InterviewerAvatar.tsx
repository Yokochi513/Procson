interface Props {
  /** 面接官の状態。thinking 時は少し表情が変わります */
  speaking?: boolean;
  size?: number;
  className?: string;
}

/**
 * 架空のAI面接官アバター（SVGイラスト）。
 * 画像生成サービスに差し替えたい場合は、この <svg> を <img src=... /> に置き換えてください。
 */
export function InterviewerAvatar({
  speaking = false,
  size = 120,
  className = "",
}: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label="AI面接官"
      className={className}
    >
      {/* 背景の円 */}
      <circle cx="60" cy="60" r="60" fill="#0e2149" />
      <circle cx="60" cy="60" r="52" fill="#16305f" />

      {/* 肩・スーツ */}
      <path
        d="M22 120 C22 96 38 86 60 86 C82 86 98 96 98 120 Z"
        fill="#1f2a44"
      />
      {/* シャツ */}
      <path d="M50 88 L60 104 L70 88 Z" fill="#f4f6fb" />
      {/* ネクタイ（アクセントカラー） */}
      <path d="M60 90 L55 98 L60 116 L65 98 Z" fill="#ff7a1a" />

      {/* 首 */}
      <rect x="52" y="74" width="16" height="16" rx="6" fill="#f0c8a0" />

      {/* 顔 */}
      <circle cx="60" cy="54" r="26" fill="#f6d2ab" />

      {/* 髪 */}
      <path
        d="M34 52 C34 34 48 26 60 26 C72 26 86 34 86 52 C86 44 78 40 60 40 C42 40 34 44 34 52 Z"
        fill="#2b2f3a"
      />

      {/* 目 */}
      <circle cx="50" cy="54" r="3.2" fill="#2b2f3a" />
      <circle cx="70" cy="54" r="3.2" fill="#2b2f3a" />

      {/* 眉 */}
      <rect x="45" y="46" width="10" height="2.4" rx="1.2" fill="#2b2f3a" />
      <rect x="65" y="46" width="10" height="2.4" rx="1.2" fill="#2b2f3a" />

      {/* 口（speaking で開く） */}
      {speaking ? (
        <ellipse cx="60" cy="66" rx="5" ry="4" fill="#a0432f" />
      ) : (
        <path
          d="M53 65 Q60 70 67 65"
          stroke="#a0432f"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
      )}

      {/* AIバッジ */}
      <g>
        <circle cx="92" cy="30" r="12" fill="#ff7a1a" />
        <text
          x="92"
          y="34"
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
          fill="#ffffff"
          fontFamily="sans-serif"
        >
          AI
        </text>
      </g>
    </svg>
  );
}
