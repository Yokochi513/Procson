/**
 * ES→スライド生成のデザインテーマ。
 * skill_es-presentation/references/design.md の配色の役割（メイン・アクセント・
 * 本文・背景・カード・ローポリ装飾）に対応する。
 * スキルのテンプレートヒアリングをアプリ上ではプリセット選択で代替する。
 */
export type SlideTheme = {
  /** 見出しボックス／タイトル文字 */
  navy: string;
  /** 見出しボックスのグラデ下（濃色バリエーション） */
  navy2: string;
  /** アクセント（数値・キーワード・強調） */
  blue: string;
  /** タイトル下線 */
  line: string;
  /** 本文テキスト */
  ink: string;
  /** 補足ラベル */
  muted: string;
  /** カード背景 */
  card: string;
  /** カード枠線 */
  cardBd: string;
  /** ページ背景 */
  page: string;
  /** 隅のローポリ風アクセント（濃） */
  polyA: string;
  /** 隅のローポリ風アクセント（淡） */
  polyB: string;
};

export type ThemePresetId = "navy" | "mono" | "warm";

export const themePresets: Record<
  ThemePresetId,
  { label: string; desc: string; theme: SlideTheme }
> = {
  navy: {
    label: "ネイビー系（推奨）",
    desc: "信頼・堅実なコーポレート調。業界を問わず使える既定デザイン。",
    theme: {
      navy: "#173D63",
      navy2: "#1F5C8B",
      blue: "#1F7FC0",
      line: "#2E6FA8",
      ink: "#2B2F36",
      muted: "#6B7683",
      card: "#FFFFFF",
      cardBd: "#E3E9F0",
      page: "#EEF3F8",
      polyA: "#DCE8F4",
      polyB: "#F3F8FD",
    },
  },
  mono: {
    label: "モノトーン",
    desc: "洗練されたシンプルな印象。コンサル・金融などの堅い業界向け。",
    theme: {
      navy: "#26292D",
      navy2: "#43494F",
      blue: "#111827",
      line: "#3A4046",
      ink: "#26292D",
      muted: "#6B7280",
      card: "#FFFFFF",
      cardBd: "#E5E7EB",
      page: "#F3F4F6",
      polyA: "#E5E7EB",
      polyB: "#F9FAFB",
    },
  },
  warm: {
    label: "暖色系",
    desc: "親しみやすく柔らかい印象。広告・小売・人材などの業界向け。",
    theme: {
      navy: "#9C4221",
      navy2: "#B85C38",
      blue: "#D97706",
      line: "#C05621",
      ink: "#33302C",
      muted: "#8A7B70",
      card: "#FFFFFF",
      cardBd: "#EFE0D2",
      page: "#FBF4EC",
      polyA: "#F5E4D0",
      polyB: "#FCF6EE",
    },
  },
};

export function isThemePresetId(value: string): value is ThemePresetId {
  return value in themePresets;
}

/**
 * 企業ブランドカラー指定のとき、メイン色とアクセント色の2色から
 * 残りの配色（下線・背景の淡色など）を機械的に導出する。
 */
export function buildBrandTheme(main: string, accent: string): SlideTheme {
  return {
    navy: main,
    navy2: mix(main, "#FFFFFF", 0.18),
    blue: accent,
    line: mix(main, accent, 0.5),
    ink: "#2B2F36",
    muted: "#6B7683",
    card: "#FFFFFF",
    cardBd: mix(main, "#FFFFFF", 0.88),
    page: mix(accent, "#FFFFFF", 0.92),
    polyA: mix(accent, "#FFFFFF", 0.82),
    polyB: mix(accent, "#FFFFFF", 0.95),
  };
}

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX_PATTERN.test(value);
}

/** テーマ全体が正しいHEX値で構成されているか検証する（APIの入力チェック用） */
export function isSlideTheme(value: unknown): value is SlideTheme {
  if (typeof value !== "object" || value === null) return false;
  const keys: (keyof SlideTheme)[] = [
    "navy",
    "navy2",
    "blue",
    "line",
    "ink",
    "muted",
    "card",
    "cardBd",
    "page",
    "polyA",
    "polyB",
  ];
  return keys.every((k) => isHexColor((value as Record<string, unknown>)[k]));
}

/** hexA と hexB を t:1-t で混色する（t=0でhexA、t=1でhexB） */
function mix(hexA: string, hexB: string, t: number): string {
  const a = parseHex(hexA);
  const b = parseHex(hexB);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function parseHex(hex: string): number[] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}
