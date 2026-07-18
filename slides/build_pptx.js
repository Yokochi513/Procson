// 就活スライド .pptx 生成スクリプト（テンプレートの配色・レイアウトを再現）
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 inch

// ===== カラーパレット（HTMLと同一） =====
const NAVY = "17456B";
const NAVY_DARK = "123A5C";
const ACCENT = "1E86CB";
const ACCENT_STRONG = "0E6FB5";
const TEXT = "333333";
const CARD_BORDER = "E1E8EF";
const LINE = "C9D6E2";
const NOTE_BG = "F3F8FC";
const NOTE_BORDER = "D7E7F3";
const TAG_BG = "EAF3FA";
const TAG_BORDER = "CFE4F4";
const HL = "BFE0F5";
const WHITE = "FFFFFF";

const FONT = "Meiryo"; // 日本語ゴシック
const PW = 13.33, PH = 7.5;
const ML = 0.6, MR = 0.6, MT = 0.5;

// ===== 共通パーツ =====
function polyBg(slide) {
  slide.background = { color: WHITE };
  // 淡いブルーのロー ポリ風テクスチャ（角に控えめに配置）
  const tri = (x, y, w, h, color, rot, tr) =>
    slide.addShape(pres.ShapeType.triangle, {
      x, y, w, h, rotate: rot, fill: { color, transparency: tr }, line: { type: "none" },
    });
  tri(-0.3, -0.4, 2.6, 1.9, "DFEAF3", 180, 45);
  tri(0.3, -0.5, 2.2, 1.6, "E8F0F7", 210, 55);
  tri(11.1, 6.0, 2.8, 2.1, "DFEAF3", 0, 45);
  tri(10.4, 6.2, 2.2, 1.7, "E8F0F7", 30, 55);
  tri(12.0, -0.3, 2.0, 1.5, "EAF1F8", 120, 60);
  tri(-0.4, 6.1, 2.0, 1.6, "EAF1F8", 300, 60);
}

function slideTitle(slide, text) {
  // ▶ 三角マーカー
  slide.addShape(pres.ShapeType.triangle, {
    x: ML, y: MT + 0.06, w: 0.24, h: 0.30, rotate: 90,
    fill: { color: NAVY }, line: { type: "none" },
  });
  slide.addText(text, {
    x: ML + 0.36, y: MT - 0.06, w: 8, h: 0.55,
    fontFace: FONT, fontSize: 26, bold: true, color: NAVY, align: "left", valign: "middle", margin: 0,
  });
  // 下線
  slide.addShape(pres.ShapeType.line, {
    x: ML, y: MT + 0.66, w: PW - ML - MR, h: 0,
    line: { color: LINE, width: 2 },
  });
}

const SH = { type: "outer", color: "1A3A5C", opacity: 0.22, blur: 8, offset: 3, angle: 90 };

// ============================================================
// ① 自己紹介
// ============================================================
(() => {
  const slide = pres.addSlide();
  polyBg(slide);
  slideTitle(slide, "自己紹介");

  // --- 左：名刺カード ---
  const cx = ML, cy = 1.45, cw = 3.75, ch = 2.75;
  slide.addShape(pres.ShapeType.roundRect, {
    x: cx, y: cy, w: cw, h: ch, rectRadius: 0.1,
    fill: { color: NAVY }, line: { type: "none" }, shadow: { ...SH },
  });
  slide.addText(
    [
      { text: "○○大学　○○学部", options: { fontSize: 15, color: "EAF1F8", breakLine: true } },
      { text: "○○学科　4年", options: { fontSize: 15, color: "EAF1F8", breakLine: true } },
    ],
    { x: cx + 0.35, y: cy + 0.28, w: cw - 0.7, h: 0.9, fontFace: FONT, align: "left", valign: "top", margin: 0, lineSpacingMultiple: 1.3 }
  );
  slide.addText("N A M E", {
    x: cx + 0.35, y: cy + 1.25, w: cw - 0.7, h: 0.25,
    fontFace: FONT, fontSize: 11, color: "9DBBD6", charSpacing: 3, align: "left", valign: "middle", margin: 0,
  });
  slide.addText("田中 太郎", {
    x: cx + 0.35, y: cy + 1.5, w: cw - 0.7, h: 0.7,
    fontFace: FONT, fontSize: 34, bold: true, color: WHITE, align: "left", valign: "middle", margin: 0,
  });
  slide.addText("TANAKA　TARO", {
    x: cx + 0.35, y: cy + 2.22, w: cw - 0.7, h: 0.3,
    fontFace: FONT, fontSize: 11, color: "9DBBD6", charSpacing: 2, align: "left", valign: "middle", margin: 0,
  });

  // --- タグ ---
  const tags = ["# 社会学専攻", "# 独学プログラミング", "# 文系出身"];
  let tx = cx, ty = cy + ch + 0.22;
  const th = 0.42;
  tags.forEach((t) => {
    const tw = 0.34 + t.length * 0.135;
    slide.addShape(pres.ShapeType.roundRect, {
      x: tx, y: ty, w: tw, h: th, rectRadius: 0.21,
      fill: { color: TAG_BG }, line: { color: TAG_BORDER, width: 1 },
    });
    slide.addText(t, {
      x: tx, y: ty, w: tw, h: th, fontFace: FONT, fontSize: 12, bold: true,
      color: ACCENT_STRONG, align: "center", valign: "middle", margin: 0,
    });
    tx += tw + 0.14;
    if (tx + 1.5 > cx + cw + 0.1) { tx = cx; ty += th + 0.14; }
  });

  // --- 右：情報ブロック 3つ ---
  const rx = 4.7, rw = PW - MR - rx;
  const blocks = [
    { h: "研究内容", runs: [
      { text: "社会学を専攻し、", o: {} },
      { text: "地域コミュニティにおける情報格差", o: { color: ACCENT_STRONG, bold: true, fontSize: 17 } },
      { text: "の問題をテーマに研究。", o: {} },
    ]},
    { h: "研究を通して感じたこと", runs: [
      { text: "ITツールが人々の生活を変える可能性を実感し、", o: {} },
      { text: "「使う側」から「作る側」へ", o: { color: ACCENT_STRONG, bold: true, fontSize: 17 } },
      { text: "回りたいと考えるように。", o: {} },
    ]},
    { h: "現在行っていること", runs: [
      { text: "文系出身ながら、", o: {} },
      { text: "独学でプログラミングの基礎", o: { color: ACCENT_STRONG, bold: true, fontSize: 17 } },
      { text: "を学習中。", o: {} },
    ]},
  ];
  const bh = 1.5, gap = 0.2;
  let by = 1.45;
  blocks.forEach((b) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: rx, y: by, w: rw, h: bh, rectRadius: 0.06,
      fill: { color: WHITE }, line: { color: CARD_BORDER, width: 1 }, shadow: { type: "outer", color: "1A3A5C", opacity: 0.10, blur: 6, offset: 2, angle: 90 },
    });
    // 左アクセントバー
    slide.addShape(pres.ShapeType.rect, {
      x: rx, y: by, w: 0.07, h: bh, fill: { color: ACCENT }, line: { type: "none" },
    });
    // 見出し（● + テキスト）
    slide.addShape(pres.ShapeType.ellipse, {
      x: rx + 0.28, y: by + 0.29, w: 0.12, h: 0.12, fill: { color: ACCENT }, line: { type: "none" },
    });
    slide.addText(b.h, {
      x: rx + 0.5, y: by + 0.16, w: rw - 0.8, h: 0.4,
      fontFace: FONT, fontSize: 15, bold: true, color: NAVY, align: "left", valign: "middle", margin: 0,
    });
    slide.addText(
      b.runs.map((r) => ({ text: r.text, options: { fontSize: 15, color: TEXT, ...r.o } })),
      { x: rx + 0.28, y: by + 0.62, w: rw - 0.56, h: bh - 0.72, fontFace: FONT, align: "left", valign: "top", margin: 0, lineSpacingMultiple: 1.25 }
    );
    by += bh + gap;
  });
})();

// ============================================================
// ② 志望動機
// ============================================================
(() => {
  const slide = pres.addSlide();
  polyBg(slide);
  slideTitle(slide, "志望動機");

  slide.addText("MY MOTIVATION", {
    x: 0, y: 1.75, w: PW, h: 0.4,
    fontFace: FONT, fontSize: 14, bold: true, color: ACCENT_STRONG, charSpacing: 3, align: "center", valign: "middle",
  });
  slide.addText(
    [
      { text: "ユーザー視点のものづくり", options: { highlight: HL } },
      { text: "に、", options: { breakLine: true } },
      { text: "強く共感したからです。", options: {} },
    ],
    { x: 1.0, y: 2.55, w: PW - 2.0, h: 1.9, fontFace: FONT, fontSize: 36, bold: true, color: NAVY, align: "center", valign: "top", lineSpacingMultiple: 1.35 }
  );

  // 補足ボックス
  const nx = 3.0, nw = PW - 6.0, ny = 5.05, nh = 1.25;
  slide.addShape(pres.ShapeType.roundRect, {
    x: nx, y: ny, w: nw, h: nh, rectRadius: 0.1,
    fill: { color: NOTE_BG }, line: { color: NOTE_BORDER, width: 1 },
  });
  slide.addText("── 補足", {
    x: nx + 0.4, y: ny + 0.18, w: nw - 0.8, h: 0.3,
    fontFace: FONT, fontSize: 13, bold: true, color: ACCENT_STRONG, charSpacing: 1, align: "left", valign: "middle", margin: 0,
  });
  slide.addText("研究で培った「人間理解」の視点を活かせると感じたため。", {
    x: nx + 0.4, y: ny + 0.5, w: nw - 0.8, h: 0.6,
    fontFace: FONT, fontSize: 18, bold: true, color: TEXT, align: "left", valign: "middle", margin: 0,
  });
})();

// ============================================================
// ③ 自己PR
// ============================================================
(() => {
  const slide = pres.addSlide();
  polyBg(slide);
  slideTitle(slide, "自己PR");

  // 強みバー
  const sx = ML, sy = 1.55, sw = PW - ML - MR, sh = 1.55;
  slide.addShape(pres.ShapeType.roundRect, {
    x: sx, y: sy, w: sw, h: sh, rectRadius: 0.1,
    fill: { color: NAVY }, line: { type: "none" }, shadow: { ...SH },
  });
  slide.addText("MY STRENGTH ── 私の強み", {
    x: sx, y: sy + 0.22, w: sw, h: 0.3,
    fontFace: FONT, fontSize: 13, color: "9DBBD6", charSpacing: 2, align: "center", valign: "middle",
  });
  slide.addText(
    [
      { text: "「", options: { color: "8FD0F7" } },
      { text: "課題を分解し、周囲を巻き込みながら解決に導く力", options: { color: WHITE } },
      { text: "」", options: { color: "8FD0F7" } },
    ],
    { x: sx + 0.3, y: sy + 0.55, w: sw - 0.6, h: 0.85, fontFace: FONT, fontSize: 27, bold: true, align: "center", valign: "middle" }
  );

  // 2カラム
  const gy = sy + sh + 0.35, gh = 2.65, ggap = 0.4;
  const gw = (sw - ggap) / 2;
  const cards = [
    { head: "根拠となる経験", headBg: NAVY, runs: [
      { text: "アンケート集計を自動化し、", o: {} },
      { text: "作業時間を6割削減", o: { color: ACCENT_STRONG, bold: true, fontSize: 18 } },
      { text: "。", o: {} },
    ]},
    { head: "入社後の活かし方", headBg: ACCENT_STRONG, runs: [
      { text: "複雑な要件を", o: {} },
      { text: "構造的に整理", o: { color: ACCENT_STRONG, bold: true, fontSize: 18 } },
      { text: "し、開発現場で貢献。", o: {} },
    ]},
  ];
  cards.forEach((c, i) => {
    const x = sx + i * (gw + ggap);
    slide.addShape(pres.ShapeType.roundRect, {
      x, y: gy, w: gw, h: gh, rectRadius: 0.08,
      fill: { color: WHITE }, line: { color: CARD_BORDER, width: 1 }, shadow: { type: "outer", color: "1A3A5C", opacity: 0.12, blur: 7, offset: 2, angle: 90 },
    });
    // ヘッダー
    const hh = 0.62;
    slide.addShape(pres.ShapeType.roundRect, {
      x, y: gy, w: gw, h: hh, rectRadius: 0.08,
      fill: { color: c.headBg }, line: { type: "none" },
    });
    // 下側の角を四角く見せる被せ
    slide.addShape(pres.ShapeType.rect, {
      x, y: gy + hh - 0.12, w: gw, h: 0.12, fill: { color: c.headBg }, line: { type: "none" },
    });
    slide.addText(c.head, {
      x, y: gy, w: gw, h: hh, fontFace: FONT, fontSize: 16, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0,
    });
    slide.addText(
      c.runs.map((r) => ({ text: r.text, options: { fontSize: 17, color: TEXT, bold: true, ...r.o } })),
      { x: x + 0.35, y: gy + hh + 0.15, w: gw - 0.7, h: gh - hh - 0.4, fontFace: FONT, align: "center", valign: "middle", margin: 0, lineSpacingMultiple: 1.3 }
    );
  });
})();

pres.writeFile({ fileName: "/home/user/Procson/slides/job_application_slides.pptx" }).then((f) => {
  console.log("wrote", f);
});
