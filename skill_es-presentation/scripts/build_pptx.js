// ============================================================
// 就活スライド .pptx 生成テンプレート（自己紹介 / 志望動機 / 自己PR）
// 使い方: 下の【EDIT】ブロック（PALETTE と CONTENT）を、
//   ・テンプレートの配色
//   ・ES から要約した各スライドの文言
// に書き換えて `node build_pptx.js` を実行する。
// レイアウト（座標・装飾）は3枚ぶん実装済みなので、通常は文言と色だけ変えればよい。
// 強調したい語は本文を配列で書き、その run に em:true を付ける（アクセント色＋少し大きく）。
// ============================================================
const pptxgen = require("pptxgenjs");

// ===================== 【EDIT 1: 配色】 =====================
const PALETTE = {
  NAVY: "17456B",         // メイン（見出し・ヘッダーバー・名刺カード）
  NAVY_DARK: "123A5C",
  ACCENT: "1E86CB",       // アクセント（強調・数値）
  ACCENT_STRONG: "0E6FB5",
  ACCENT_LIGHT: "9DBBD6", // カード内の淡いラベル
  ACCENT_ON_NAVY: "8FD0F7",
  TEXT: "333333",
  CARD_BORDER: "E1E8EF",
  LINE: "C9D6E2",
  NOTE_BG: "F3F8FC",
  NOTE_BORDER: "D7E7F3",
  TAG_BG: "EAF3FA",
  TAG_BORDER: "CFE4F4",
  HL: "BFE0F5",           // 一言のマーカー
  POLY1: "DFEAF3", POLY2: "E8F0F7", POLY3: "EAF1F8", // 背景の三角形
  WHITE: "FFFFFF",
};
const FONT = "Meiryo"; // 日本語ゴシック

// ===================== 【EDIT 2: 文言】 =====================
// em:true を付けた run はアクセント色＋太字＋少し大きく表示される。
const CONTENT = {
  outFile: "job_application_slides.pptx",

  intro: {                       // ① 自己紹介
    university: "○○大学　○○学部",
    department: "○○学科　4年",
    name: "田中 太郎",
    nameRoman: "TANAKA　TARO",
    tags: ["# 社会学専攻", "# 独学プログラミング", "# 文系出身"],
    blocks: [
      { head: "研究内容", body: [
        { t: "社会学を専攻し、" },
        { t: "地域コミュニティにおける情報格差", em: true },
        { t: "の問題をテーマに研究。" },
      ]},
      { head: "研究を通して感じたこと", body: [
        { t: "ITツールが人々の生活を変える可能性を実感し、" },
        { t: "「使う側」から「作る側」へ", em: true },
        { t: "回りたいと考えるように。" },
      ]},
      { head: "現在行っていること", body: [
        { t: "文系出身ながら、" },
        { t: "独学でプログラミングの基礎", em: true },
        { t: "を学習中。" },
      ]},
    ],
  },

  motivation: {                  // ② 志望動機
    eyebrow: "MY MOTIVATION",
    onelineHighlight: "ユーザー視点のものづくり", // マーカーが付く部分
    onelineTail: "に、",                          // 1行目の残り
    onelineSecond: "強く共感したからです。",       // 2行目
    note: "研究で培った「人間理解」の視点を活かせると感じたため。", // 補足20字程度
  },

  pr: {                          // ③ 自己PR
    eyebrow: "MY STRENGTH ── 私の強み",
    strength: "課題を分解し、周囲を巻き込みながら解決に導く力", // かぎ括弧は自動で付く
    cards: [
      { head: "根拠となる経験", accent: false, body: [
        { t: "アンケート集計を自動化し、" },
        { t: "作業時間を6割削減", em: true },
        { t: "。" },
      ]},
      { head: "入社後の活かし方", accent: true, body: [
        { t: "複雑な要件を" },
        { t: "構造的に整理", em: true },
        { t: "し、開発現場で貢献。" },
      ]},
    ],
  },
};

// ============================================================
// ここから下はレイアウト実装（通常は編集不要）
// ============================================================
const P = PALETTE;
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
const PW = 13.33, PH = 7.5, ML = 0.6, MR = 0.6, MT = 0.5;

function polyBg(slide) {
  slide.background = { color: P.WHITE };
  const tri = (x, y, w, h, color, rot, tr) =>
    slide.addShape(pres.ShapeType.triangle, { x, y, w, h, rotate: rot, fill: { color, transparency: tr }, line: { type: "none" } });
  tri(-0.3, -0.4, 2.6, 1.9, P.POLY1, 180, 45);
  tri(0.3, -0.5, 2.2, 1.6, P.POLY2, 210, 55);
  tri(11.1, 6.0, 2.8, 2.1, P.POLY1, 0, 45);
  tri(10.4, 6.2, 2.2, 1.7, P.POLY2, 30, 55);
  tri(12.0, -0.3, 2.0, 1.5, P.POLY3, 120, 60);
  tri(-0.4, 6.1, 2.0, 1.6, P.POLY3, 300, 60);
}
function slideTitle(slide, text) {
  slide.addShape(pres.ShapeType.triangle, { x: ML, y: MT + 0.06, w: 0.24, h: 0.30, rotate: 90, fill: { color: P.NAVY }, line: { type: "none" } });
  slide.addText(text, { x: ML + 0.36, y: MT - 0.06, w: 8, h: 0.55, fontFace: FONT, fontSize: 26, bold: true, color: P.NAVY, align: "left", valign: "middle", margin: 0 });
  slide.addShape(pres.ShapeType.line, { x: ML, y: MT + 0.66, w: PW - ML - MR, h: 0, line: { color: P.LINE, width: 2 } });
}
const shadow = () => ({ type: "outer", color: "1A3A5C", opacity: 0.22, blur: 8, offset: 3, angle: 90 });
const cardShadow = () => ({ type: "outer", color: "1A3A5C", opacity: 0.12, blur: 7, offset: 2, angle: 90 });
// 本文 run 配列 → pptxgenjs テキスト配列（em で強調）
const runs = (arr, base, emSize) => arr.map((r) => ({ text: r.t, options: { fontSize: r.em ? emSize : base, color: r.em ? P.ACCENT_STRONG : P.TEXT, bold: !!r.em || undefined } }));

// ① 自己紹介
(() => {
  const c = CONTENT.intro, slide = pres.addSlide();
  polyBg(slide); slideTitle(slide, "自己紹介");
  const cx = ML, cy = 1.45, cw = 3.75, ch = 2.75;
  slide.addShape(pres.ShapeType.roundRect, { x: cx, y: cy, w: cw, h: ch, rectRadius: 0.1, fill: { color: P.NAVY }, line: { type: "none" }, shadow: shadow() });
  slide.addText(
    [ { text: c.university, options: { fontSize: 15, color: "EAF1F8", breakLine: true } },
      { text: c.department, options: { fontSize: 15, color: "EAF1F8", breakLine: true } } ],
    { x: cx + 0.35, y: cy + 0.28, w: cw - 0.7, h: 0.9, fontFace: FONT, align: "left", valign: "top", margin: 0, lineSpacingMultiple: 1.3 });
  slide.addText("N A M E", { x: cx + 0.35, y: cy + 1.25, w: cw - 0.7, h: 0.25, fontFace: FONT, fontSize: 11, color: P.ACCENT_LIGHT, charSpacing: 3, align: "left", valign: "middle", margin: 0 });
  slide.addText(c.name, { x: cx + 0.35, y: cy + 1.5, w: cw - 0.7, h: 0.7, fontFace: FONT, fontSize: 34, bold: true, color: P.WHITE, align: "left", valign: "middle", margin: 0 });
  slide.addText(c.nameRoman, { x: cx + 0.35, y: cy + 2.22, w: cw - 0.7, h: 0.3, fontFace: FONT, fontSize: 11, color: P.ACCENT_LIGHT, charSpacing: 2, align: "left", valign: "middle", margin: 0 });
  let tx = cx, ty = cy + ch + 0.22; const th = 0.42;
  c.tags.forEach((t) => {
    const tw = 0.34 + t.length * 0.135;
    slide.addShape(pres.ShapeType.roundRect, { x: tx, y: ty, w: tw, h: th, rectRadius: 0.21, fill: { color: P.TAG_BG }, line: { color: P.TAG_BORDER, width: 1 } });
    slide.addText(t, { x: tx, y: ty, w: tw, h: th, fontFace: FONT, fontSize: 12, bold: true, color: P.ACCENT_STRONG, align: "center", valign: "middle", margin: 0 });
    tx += tw + 0.14; if (tx + 1.5 > cx + cw + 0.1) { tx = cx; ty += th + 0.14; }
  });
  const rx = 4.7, rw = PW - MR - rx, bh = 1.5, gap = 0.2; let by = 1.45;
  c.blocks.forEach((b) => {
    slide.addShape(pres.ShapeType.roundRect, { x: rx, y: by, w: rw, h: bh, rectRadius: 0.06, fill: { color: P.WHITE }, line: { color: P.CARD_BORDER, width: 1 }, shadow: { type: "outer", color: "1A3A5C", opacity: 0.10, blur: 6, offset: 2, angle: 90 } });
    slide.addShape(pres.ShapeType.rect, { x: rx, y: by, w: 0.07, h: bh, fill: { color: P.ACCENT }, line: { type: "none" } });
    slide.addShape(pres.ShapeType.ellipse, { x: rx + 0.28, y: by + 0.29, w: 0.12, h: 0.12, fill: { color: P.ACCENT }, line: { type: "none" } });
    slide.addText(b.head, { x: rx + 0.5, y: by + 0.16, w: rw - 0.8, h: 0.4, fontFace: FONT, fontSize: 15, bold: true, color: P.NAVY, align: "left", valign: "middle", margin: 0 });
    slide.addText(runs(b.body, 15, 17), { x: rx + 0.28, y: by + 0.62, w: rw - 0.56, h: bh - 0.72, fontFace: FONT, align: "left", valign: "top", margin: 0, lineSpacingMultiple: 1.25 });
    by += bh + gap;
  });
})();

// ② 志望動機
(() => {
  const c = CONTENT.motivation, slide = pres.addSlide();
  polyBg(slide); slideTitle(slide, "志望動機");
  slide.addText(c.eyebrow, { x: 0, y: 1.75, w: PW, h: 0.4, fontFace: FONT, fontSize: 14, bold: true, color: P.ACCENT_STRONG, charSpacing: 3, align: "center", valign: "middle" });
  slide.addText(
    [ { text: c.onelineHighlight, options: { highlight: P.HL } },
      { text: c.onelineTail, options: { breakLine: true } },
      { text: c.onelineSecond, options: {} } ],
    { x: 1.0, y: 2.55, w: PW - 2.0, h: 1.9, fontFace: FONT, fontSize: 36, bold: true, color: P.NAVY, align: "center", valign: "top", lineSpacingMultiple: 1.35 });
  const nx = 3.0, nw = PW - 6.0, ny = 5.05, nh = 1.25;
  slide.addShape(pres.ShapeType.roundRect, { x: nx, y: ny, w: nw, h: nh, rectRadius: 0.1, fill: { color: P.NOTE_BG }, line: { color: P.NOTE_BORDER, width: 1 } });
  slide.addText("── 補足", { x: nx + 0.4, y: ny + 0.18, w: nw - 0.8, h: 0.3, fontFace: FONT, fontSize: 13, bold: true, color: P.ACCENT_STRONG, charSpacing: 1, align: "left", valign: "middle", margin: 0 });
  slide.addText(c.note, { x: nx + 0.4, y: ny + 0.5, w: nw - 0.8, h: 0.6, fontFace: FONT, fontSize: 18, bold: true, color: P.TEXT, align: "left", valign: "middle", margin: 0 });
})();

// ③ 自己PR
(() => {
  const c = CONTENT.pr, slide = pres.addSlide();
  polyBg(slide); slideTitle(slide, "自己PR");
  const sx = ML, sy = 1.55, sw = PW - ML - MR, sh = 1.55;
  slide.addShape(pres.ShapeType.roundRect, { x: sx, y: sy, w: sw, h: sh, rectRadius: 0.1, fill: { color: P.NAVY }, line: { type: "none" }, shadow: shadow() });
  slide.addText(c.eyebrow, { x: sx, y: sy + 0.22, w: sw, h: 0.3, fontFace: FONT, fontSize: 13, color: P.ACCENT_LIGHT, charSpacing: 2, align: "center", valign: "middle" });
  slide.addText(
    [ { text: "「", options: { color: P.ACCENT_ON_NAVY } },
      { text: c.strength, options: { color: P.WHITE } },
      { text: "」", options: { color: P.ACCENT_ON_NAVY } } ],
    { x: sx + 0.3, y: sy + 0.55, w: sw - 0.6, h: 0.85, fontFace: FONT, fontSize: 27, bold: true, align: "center", valign: "middle" });
  const gy = sy + sh + 0.35, gh = 2.65, ggap = 0.4, gw = (sw - ggap) / 2;
  c.cards.forEach((card, i) => {
    const x = sx + i * (gw + ggap), headBg = card.accent ? P.ACCENT_STRONG : P.NAVY, hh = 0.62;
    slide.addShape(pres.ShapeType.roundRect, { x, y: gy, w: gw, h: gh, rectRadius: 0.08, fill: { color: P.WHITE }, line: { color: P.CARD_BORDER, width: 1 }, shadow: cardShadow() });
    slide.addShape(pres.ShapeType.roundRect, { x, y: gy, w: gw, h: hh, rectRadius: 0.08, fill: { color: headBg }, line: { type: "none" } });
    slide.addShape(pres.ShapeType.rect, { x, y: gy + hh - 0.12, w: gw, h: 0.12, fill: { color: headBg }, line: { type: "none" } });
    slide.addText(card.head, { x, y: gy, w: gw, h: hh, fontFace: FONT, fontSize: 16, bold: true, color: P.WHITE, align: "center", valign: "middle", margin: 0 });
    slide.addText(runs(card.body, 17, 18), { x: x + 0.35, y: gy + hh + 0.15, w: gw - 0.7, h: gh - hh - 0.4, fontFace: FONT, align: "center", valign: "middle", margin: 0, lineSpacingMultiple: 1.3, bold: true });
  });
})();

pres.writeFile({ fileName: CONTENT.outFile }).then((f) => console.log("wrote", f));
