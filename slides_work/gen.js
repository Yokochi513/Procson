const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
const W = 13.333, H = 7.5;

// ---- Palette (Ocean / professional for IT・Web) ----
const NAVY   = "0E2A40"; // dark bg
const NAVY2  = "163E5C"; // dark bg accent
const PRIM   = "1C6E8C"; // primary teal-blue
const PRIM_D = "134E63";
const ACCENT = "18B39A"; // mint accent (stats)
const GOLD   = "F2B34B"; // warm accent
const WHITE  = "FFFFFF";
const PANEL  = "F1F5F8"; // light panel
const PANEL2 = "E4ECF1";
const TXT    = "1E2D3A"; // dark text
const MUTE   = "5C6B78"; // muted text
const LINE   = "D5DFE6";

const HEAD = "Yu Gothic";
const BODY = "Meiryo";

const sh = () => ({ type: "outer", color: "8AA0B0", opacity: 0.35, blur: 8, offset: 3, angle: 90 });

// small helper: numbered circle
function numCircle(s, x, y, d, n, fill, txtColor) {
  s.addShape(p.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: fill }, line: { type: "none" } });
  s.addText(String(n), { x, y, w: d, h: d, align: "center", valign: "middle",
    fontFace: HEAD, fontSize: d > 0.6 ? 20 : 14, bold: true, color: txtColor });
}

function pageNum(s, n) {
  s.addText(String(n).padStart(2, "0"), { x: W - 1.0, y: H - 0.55, w: 0.6, h: 0.35,
    align: "right", fontFace: BODY, fontSize: 10, color: MUTE });
}

// =================================================================
// Slide 1 — Title (dark)
// =================================================================
{
  const s = p.addSlide();
  s.background = { color: NAVY };
  // decorative soft circles
  s.addShape(p.ShapeType.ellipse, { x: 9.7, y: -2.2, w: 6.5, h: 6.5, fill: { color: NAVY2 }, line: { type: "none" } });
  s.addShape(p.ShapeType.ellipse, { x: 11.4, y: 3.6, w: 4.6, h: 4.6, fill: { color: PRIM_D }, line: { type: "none" } });
  s.addShape(p.ShapeType.ellipse, { x: 11.9, y: 5.1, w: 1.9, h: 1.9, fill: { color: ACCENT }, line: { type: "none" } });

  s.addText("ENTRY SHEET / SELF INTRODUCTION", { x: 0.9, y: 1.35, w: 8, h: 0.4,
    fontFace: BODY, fontSize: 13, bold: true, color: ACCENT, charSpacing: 3 });

  s.addText("自己紹介", { x: 0.85, y: 1.85, w: 9, h: 1.5,
    fontFace: HEAD, fontSize: 66, bold: true, color: WHITE });
  s.addText("エントリーシート ダイジェスト", { x: 0.9, y: 3.25, w: 9, h: 0.7,
    fontFace: HEAD, fontSize: 26, color: "CADCEC" });

  // name block
  s.addShape(p.ShapeType.roundRect, { x: 0.9, y: 4.55, w: 6.4, h: 1.65, rectRadius: 0.12,
    fill: { color: NAVY2 }, line: { type: "none" }, shadow: sh() });
  s.addText([
    { text: "山田 太郎", options: { fontFace: HEAD, fontSize: 26, bold: true, color: WHITE, breakLine: true } },
    { text: "ヤマダ タロウ", options: { fontFace: BODY, fontSize: 12, color: "9FB4C6" } },
  ], { x: 1.25, y: 4.7, w: 3.0, h: 1.35, valign: "middle", align: "left", lineSpacingMultiple: 1.1 });
  s.addShape(p.ShapeType.line, { x: 4.35, y: 4.9, w: 0, h: 0.95, line: { color: PRIM, width: 1.5 } });
  s.addText([
    { text: "◯◯大学 経済学部 経営学科", options: { fontFace: BODY, fontSize: 12.5, color: WHITE, breakLine: true } },
    { text: "202X年3月 卒業予定", options: { fontFace: BODY, fontSize: 11, color: "9FB4C6" } },
  ], { x: 4.6, y: 4.7, w: 2.6, h: 1.35, valign: "middle", align: "left", lineSpacingMultiple: 1.25 });

  s.addText("志望業界：IT・Webサービス   |   志望職種：企画営業職 / プロダクトマネージャー候補",
    { x: 0.95, y: 6.55, w: 11, h: 0.4, fontFace: BODY, fontSize: 12.5, color: "CADCEC" });
}

// =================================================================
// Slide 2 — Profile / 基本情報
// =================================================================
{
  const s = p.addSlide();
  s.background = { color: WHITE };
  s.addText("基本情報", { x: 0.9, y: 0.55, w: 8, h: 0.7, fontFace: HEAD, fontSize: 34, bold: true, color: TXT });
  s.addText("PROFILE", { x: 0.95, y: 1.22, w: 8, h: 0.35, fontFace: BODY, fontSize: 12, bold: true, color: PRIM, charSpacing: 3 });

  // left profile card
  s.addShape(p.ShapeType.roundRect, { x: 0.9, y: 1.95, w: 4.3, h: 4.75, rectRadius: 0.1,
    fill: { color: NAVY }, line: { type: "none" }, shadow: sh() });
  s.addShape(p.ShapeType.ellipse, { x: 2.5, y: 2.45, w: 1.1, h: 1.1, fill: { color: ACCENT }, line: { type: "none" } });
  s.addText("山田", { x: 2.5, y: 2.45, w: 1.1, h: 1.1, align: "center", valign: "middle", fontFace: HEAD, fontSize: 20, bold: true, color: NAVY });
  s.addText("山田 太郎", { x: 1.0, y: 3.65, w: 4.1, h: 0.5, align: "center", fontFace: HEAD, fontSize: 22, bold: true, color: WHITE });
  s.addText("ヤマダ タロウ", { x: 1.0, y: 4.12, w: 4.1, h: 0.35, align: "center", fontFace: BODY, fontSize: 11, color: "9FB4C6" });
  s.addShape(p.ShapeType.line, { x: 1.6, y: 4.65, w: 2.9, h: 0, line: { color: PRIM, width: 1 } });
  s.addText([
    { text: "経済学部 経営学科", options: { fontFace: BODY, fontSize: 13, color: WHITE, breakLine: true, align: "center" } },
    { text: "◯◯大学 ・ 202X年3月卒業予定", options: { fontFace: BODY, fontSize: 11, color: "B7C7D6", align: "center" } },
  ], { x: 1.0, y: 4.9, w: 4.1, h: 1.5, valign: "top", lineSpacingMultiple: 1.4 });

  // right: info rows
  const rows = [
    ["志望業界", "IT・Webサービス業界"],
    ["志望職種", "企画営業職 / プロダクトマネージャー候補"],
    ["軸となる想い", "業務効率化で人々が創造的な仕事に集中できる社会へ"],
    ["強みキーワード", "課題の本質を見極める力 ・ 粘り強い実行力 ・ 巻き込み力"],
  ];
  let y = 1.95;
  const rh = 1.12, gap = 0.1;
  rows.forEach((r, i) => {
    s.addShape(p.ShapeType.roundRect, { x: 5.55, y, w: 6.9, h: rh, rectRadius: 0.08,
      fill: { color: PANEL }, line: { type: "none" } });
    numCircle(s, 5.85, y + (rh - 0.55) / 2, 0.55, i + 1, PRIM, WHITE);
    s.addText(r[0], { x: 6.6, y: y + 0.16, w: 5.6, h: 0.4, fontFace: HEAD, fontSize: 13, bold: true, color: PRIM });
    s.addText(r[1], { x: 6.6, y: y + 0.55, w: 5.7, h: 0.5, fontFace: BODY, fontSize: 13, color: TXT });
    y += rh + gap;
  });
  pageNum(s, 2);
}

// =================================================================
// Slide 3 — 志望動機
// =================================================================
{
  const s = p.addSlide();
  s.background = { color: WHITE };
  s.addText("志望動機", { x: 0.9, y: 0.55, w: 9, h: 0.7, fontFace: HEAD, fontSize: 34, bold: true, color: TXT });
  s.addText("MOTIVATION", { x: 0.95, y: 1.22, w: 8, h: 0.35, fontFace: BODY, fontSize: 12, bold: true, color: PRIM, charSpacing: 3 });

  // pull-quote band
  s.addShape(p.ShapeType.roundRect, { x: 0.9, y: 1.9, w: 11.55, h: 1.25, rectRadius: 0.1,
    fill: { color: NAVY }, line: { type: "none" }, shadow: sh() });
  s.addText("“ 業務効率化を通じて、人々がより創造的な仕事に集中できる社会を実現したい ”",
    { x: 1.3, y: 1.9, w: 10.8, h: 1.25, valign: "middle", fontFace: HEAD, fontSize: 20, bold: true, italic: true, color: WHITE });

  // three point cards
  const cards = [
    ["きっかけ", "インターンで中小企業のバックオフィス業務の煩雑さを目の当たりにし、DXの必要性を痛感。"],
    ["貴社の強み", "クラウドツールを通じ、多様な企業のDX支援で圧倒的な実績と革新的なソリューションを保有。"],
    ["入社後の実現", "企画営業として顧客の真の課題を深掘りし、導入から運用定着まで伴走。将来は新サービス企画にも挑戦。"],
  ];
  const cw = 3.65, cx0 = 0.9, cgap = 0.3, cy = 3.5, ch = 2.85;
  cards.forEach((c, i) => {
    const x = cx0 + i * (cw + cgap);
    s.addShape(p.ShapeType.roundRect, { x, y: cy, w: cw, h: ch, rectRadius: 0.09,
      fill: { color: PANEL }, line: { type: "none" }, shadow: sh() });
    numCircle(s, x + 0.35, cy + 0.35, 0.7, i + 1, i === 2 ? ACCENT : PRIM, WHITE);
    s.addText(c[0], { x: x + 1.2, y: cy + 0.42, w: cw - 1.35, h: 0.55, valign: "middle", fontFace: HEAD, fontSize: 16, bold: true, color: TXT });
    s.addText(c[1], { x: x + 0.35, y: cy + 1.3, w: cw - 0.7, h: 1.4, fontFace: BODY, fontSize: 12.5, color: MUTE, lineSpacingMultiple: 1.25 });
  });
  s.addText("（332文字 / 志望動機）", { x: 0.9, y: 6.75, w: 6, h: 0.3, fontFace: BODY, fontSize: 10, color: MUTE });
  pageNum(s, 3);
}

// =================================================================
// Slide 4 — ガクチカ
// =================================================================
{
  const s = p.addSlide();
  s.background = { color: WHITE };
  s.addText("学生時代に打ち込んだこと", { x: 0.9, y: 0.55, w: 10, h: 0.7, fontFace: HEAD, fontSize: 32, bold: true, color: TXT });
  s.addText("GAKUCHIKA  ｜  Webマーケティングサークル・SNS集客支援", { x: 0.95, y: 1.22, w: 10, h: 0.35, fontFace: BODY, fontSize: 12, bold: true, color: PRIM });

  // left big stat
  s.addShape(p.ShapeType.roundRect, { x: 0.9, y: 1.95, w: 3.6, h: 4.75, rectRadius: 0.1,
    fill: { color: PRIM }, line: { type: "none" }, shadow: sh() });
  s.addText("参加店舗の来店数", { x: 1.05, y: 2.55, w: 3.3, h: 0.4, align: "center", fontFace: BODY, fontSize: 13, color: "D6E7EE" });
  s.addText([
    { text: "150", options: { fontFace: HEAD, fontSize: 82, bold: true, color: WHITE } },
    { text: " %", options: { fontFace: HEAD, fontSize: 30, bold: true, color: ACCENT } },
  ], { x: 1.05, y: 3.05, w: 3.3, h: 1.35, align: "center", valign: "middle" });
  s.addText("前年比（目標を達成）", { x: 1.05, y: 4.5, w: 3.3, h: 0.4, align: "center", fontFace: BODY, fontSize: 12, color: "D6E7EE" });
  s.addShape(p.ShapeType.line, { x: 1.5, y: 5.05, w: 2.4, h: 0, line: { color: "4E93AB", width: 1 } });
  s.addText("リーダーとしてチームを牽引", { x: 1.05, y: 5.25, w: 3.3, h: 1.0, align: "center", valign: "top", fontFace: BODY, fontSize: 12.5, color: WHITE, lineSpacingMultiple: 1.3 });

  // right: challenge + 2 actions
  s.addShape(p.ShapeType.roundRect, { x: 4.75, y: 1.95, w: 7.7, h: 1.15, rectRadius: 0.08,
    fill: { color: PANEL2 }, line: { type: "none" } });
  s.addText([
    { text: "課題　", options: { fontFace: HEAD, fontSize: 13, bold: true, color: PRIM_D } },
    { text: "メンバー間で施策への認識のズレがあり、投稿頻度や内容の質が安定しない", options: { fontFace: BODY, fontSize: 13, color: TXT } },
  ], { x: 5.05, y: 1.95, w: 7.15, h: 1.15, valign: "middle", lineSpacingMultiple: 1.2 });

  const acts = [
    ["ペルソナシートで軸を統一", "週1回の定例MTGで各店舗のターゲット層や強みを整理・共有し、施策の軸をチームで統一。"],
    ["ダッシュボードで可視化", "投稿データの分析数値を可視化し、施策の効果をチーム全体で一目で把握できる状態に。"],
  ];
  let ay = 3.3;
  acts.forEach((a, i) => {
    s.addShape(p.ShapeType.roundRect, { x: 4.75, y: ay, w: 7.7, h: 1.35, rectRadius: 0.08,
      fill: { color: PANEL }, line: { type: "none" }, shadow: sh() });
    numCircle(s, 5.05, ay + 0.4, 0.55, i + 1, ACCENT, NAVY);
    s.addText(a[0], { x: 5.8, y: ay + 0.16, w: 6.4, h: 0.45, fontFace: HEAD, fontSize: 15, bold: true, color: TXT });
    s.addText(a[1], { x: 5.8, y: ay + 0.62, w: 6.45, h: 0.65, fontFace: BODY, fontSize: 12, color: MUTE, lineSpacingMultiple: 1.15 });
    ay += 1.5;
  });
  s.addText("学び：共通の目標に向かって組織の一体感を醸成する「巻き込み力」", { x: 4.75, y: 6.35, w: 7.7, h: 0.4,
    fontFace: BODY, fontSize: 12.5, bold: true, italic: true, color: PRIM_D });
  pageNum(s, 4);
}

// =================================================================
// Slide 5 — 自己PR
// =================================================================
{
  const s = p.addSlide();
  s.background = { color: WHITE };
  s.addText("自己PR", { x: 0.9, y: 0.55, w: 10, h: 0.7, fontFace: HEAD, fontSize: 34, bold: true, color: TXT });
  s.addText("STRENGTH  ｜  課題の本質を見極め、粘り強く解決に向けて行動する力", { x: 0.95, y: 1.22, w: 11, h: 0.35, fontFace: BODY, fontSize: 12, bold: true, color: PRIM });

  // process flow: 課題 → 分析 → 施策 → 成果
  const steps = [
    ["課題の発見", "カフェのアルバイトで新人の離職率が高い（年間約40%）問題に直面。"],
    ["多角的な分析", "店長や既存スタッフに加え、退職した新人にも個別に相談し原因を特定。"],
    ["施策の実行", "『ステップアップノート』作成・コミュニケーションカード導入・新人サポート担当を固定化。"],
  ];
  const cw = 3.65, cx0 = 0.9, cgap = 0.3, cy = 1.95, ch = 2.65;
  steps.forEach((c, i) => {
    const x = cx0 + i * (cw + cgap);
    s.addShape(p.ShapeType.roundRect, { x, y: cy, w: cw, h: ch, rectRadius: 0.09,
      fill: { color: PANEL }, line: { type: "none" }, shadow: sh() });
    numCircle(s, x + 0.35, cy + 0.32, 0.65, i + 1, PRIM, WHITE);
    s.addText(c[0], { x: x + 1.15, y: cy + 0.36, w: cw - 1.3, h: 0.6, valign: "middle", fontFace: HEAD, fontSize: 15, bold: true, color: TXT });
    s.addText(c[1], { x: x + 0.35, y: cy + 1.18, w: cw - 0.7, h: 1.3, fontFace: BODY, fontSize: 12, color: MUTE, lineSpacingMultiple: 1.25 });
    if (i < 2) s.addText("▶", { x: x + cw - 0.05, y: cy + ch / 2 - 0.25, w: 0.4, h: 0.5, align: "center", valign: "middle", fontFace: BODY, fontSize: 16, color: ACCENT });
  });

  // result band with before/after
  s.addShape(p.ShapeType.roundRect, { x: 0.9, y: 4.95, w: 11.55, h: 1.75, rectRadius: 0.1,
    fill: { color: NAVY }, line: { type: "none" }, shadow: sh() });
  s.addText("半年間の運用で\n新人の離職率が大幅に改善", { x: 1.3, y: 4.95, w: 5.2, h: 1.75, valign: "middle",
    fontFace: HEAD, fontSize: 18, bold: true, color: WHITE, lineSpacingMultiple: 1.15 });
  s.addText("40%", { x: 6.5, y: 5.15, w: 1.9, h: 1.35, align: "center", valign: "middle", fontFace: HEAD, fontSize: 44, bold: true, color: "8FA6B6" });
  s.addText("→", { x: 8.35, y: 5.15, w: 1.1, h: 1.35, align: "center", valign: "middle", fontFace: HEAD, fontSize: 34, bold: true, color: ACCENT });
  s.addText([
    { text: "10", options: { fontFace: HEAD, fontSize: 56, bold: true, color: ACCENT } },
    { text: "%以下", options: { fontFace: HEAD, fontSize: 20, bold: true, color: WHITE } },
  ], { x: 9.4, y: 5.15, w: 3.0, h: 1.35, align: "center", valign: "middle" });
  pageNum(s, 5);
}

// =================================================================
// Slide 6 — 長所と短所
// =================================================================
{
  const s = p.addSlide();
  s.background = { color: WHITE };
  s.addText("長所と短所", { x: 0.9, y: 0.55, w: 10, h: 0.7, fontFace: HEAD, fontSize: 34, bold: true, color: TXT });
  s.addText("STRENGTH & WEAKNESS", { x: 0.95, y: 1.22, w: 10, h: 0.35, fontFace: BODY, fontSize: 12, bold: true, color: PRIM, charSpacing: 2 });

  // 長所
  s.addShape(p.ShapeType.roundRect, { x: 0.9, y: 1.95, w: 5.65, h: 4.6, rectRadius: 0.1,
    fill: { color: PANEL }, line: { type: "none" }, shadow: sh() });
  s.addShape(p.ShapeType.roundRect, { x: 0.9, y: 1.95, w: 5.65, h: 0.95, rectRadius: 0.1,
    fill: { color: PRIM }, line: { type: "none" } });
  s.addShape(p.ShapeType.rect, { x: 0.9, y: 2.5, w: 5.65, h: 0.4, fill: { color: PRIM }, line: { type: "none" } });
  s.addText("＋　長所", { x: 1.25, y: 1.95, w: 5, h: 0.95, valign: "middle", fontFace: HEAD, fontSize: 20, bold: true, color: WHITE });
  s.addText("目標達成に向けた粘り強さと実行力", { x: 1.25, y: 3.2, w: 5.0, h: 0.8, fontFace: HEAD, fontSize: 16, bold: true, color: TXT, lineSpacingMultiple: 1.15 });
  s.addText("困難な状況でも原因を冷静に分析し、改善策を最後まで実行しきることができます。",
    { x: 1.25, y: 4.15, w: 5.0, h: 2.1, fontFace: BODY, fontSize: 13.5, color: MUTE, lineSpacingMultiple: 1.4 });

  // 短所
  s.addShape(p.ShapeType.roundRect, { x: 6.8, y: 1.95, w: 5.65, h: 4.6, rectRadius: 0.1,
    fill: { color: PANEL }, line: { type: "none" }, shadow: sh() });
  s.addShape(p.ShapeType.roundRect, { x: 6.8, y: 1.95, w: 5.65, h: 0.95, rectRadius: 0.1,
    fill: { color: GOLD }, line: { type: "none" } });
  s.addShape(p.ShapeType.rect, { x: 6.8, y: 2.5, w: 5.65, h: 0.4, fill: { color: GOLD }, line: { type: "none" } });
  s.addText("－　短所", { x: 7.15, y: 1.95, w: 5, h: 0.95, valign: "middle", fontFace: HEAD, fontSize: 20, bold: true, color: "5A4212" });
  s.addText("凝り性で、一つの作業に没頭しすぎる点", { x: 7.15, y: 3.2, w: 5.0, h: 0.8, fontFace: HEAD, fontSize: 16, bold: true, color: TXT, lineSpacingMultiple: 1.15 });
  s.addText([
    { text: "スケジュールに余裕をなくしがちな点が課題。", options: { fontFace: BODY, fontSize: 13.5, color: MUTE, breakLine: true } },
    { text: "克服策", options: { fontFace: HEAD, fontSize: 13, bold: true, color: PRIM_D, breakLine: true } },
    { text: "タスクを細かくマイルストーン化し、完成度8割の段階で第三者にフィードバックをもらう仕組みで管理。", options: { fontFace: BODY, fontSize: 13, color: MUTE } },
  ], { x: 7.15, y: 4.15, w: 5.0, h: 2.2, valign: "top", lineSpacingMultiple: 1.35, paraSpaceAfter: 6 });
  pageNum(s, 6);
}

// =================================================================
// Slide 7 — 挫折経験
// =================================================================
{
  const s = p.addSlide();
  s.background = { color: WHITE };
  s.addText("挫折経験と乗り越えた方法", { x: 0.9, y: 0.55, w: 11, h: 0.7, fontFace: HEAD, fontSize: 32, bold: true, color: TXT });
  s.addText("SETBACK  ｜  部活動でレギュラーから外れた経験", { x: 0.95, y: 1.22, w: 10, h: 0.35, fontFace: BODY, fontSize: 12, bold: true, color: PRIM });

  const steps = [
    ["挫折", "2年時にレギュラーから外され、大きな挫折感を味わう。当時は他人の能力を羨むばかりだった。", GOLD, "5A4212"],
    ["視点の転換", "「チームにどう貢献できるか」へ視点を変え、指導者や同期から客観的なアドバイスを収集。", PRIM, WHITE],
    ["行動", "課題を『守備のポジショニング』と特定。練習後に動画でフォームを確認する自主トレを半年間継続。", PRIM, WHITE],
    ["成果", "課題を克服してレギュラーに復帰し、県大会ベスト4に貢献した。", ACCENT, NAVY],
  ];
  const n = steps.length;
  const cw = 2.78, cx0 = 0.9, cgap = 0.25, cy = 2.2, ch = 3.7;
  steps.forEach((c, i) => {
    const x = cx0 + i * (cw + cgap);
    s.addShape(p.ShapeType.roundRect, { x, y: cy, w: cw, h: ch, rectRadius: 0.1,
      fill: { color: PANEL }, line: { type: "none" }, shadow: sh() });
    s.addShape(p.ShapeType.roundRect, { x, y: cy, w: cw, h: 0.85, rectRadius: 0.1,
      fill: { color: c[2] }, line: { type: "none" } });
    s.addShape(p.ShapeType.rect, { x, y: cy + 0.45, w: cw, h: 0.4, fill: { color: c[2] }, line: { type: "none" } });
    numCircle(s, x + 0.28, cy + 0.2, 0.45, i + 1, WHITE, c[2] === GOLD ? "5A4212" : c[2]);
    s.addText(c[0], { x: x + 0.85, y: cy, w: cw - 1, h: 0.85, valign: "middle", fontFace: HEAD, fontSize: 16, bold: true, color: c[3] });
    s.addText(c[1], { x: x + 0.28, y: cy + 1.1, w: cw - 0.56, h: 2.4, fontFace: BODY, fontSize: 12, color: TXT, lineSpacingMultiple: 1.3 });
    if (i < n - 1) s.addText("▶", { x: x + cw - 0.02, y: cy + 0.2, w: 0.28, h: 0.45, align: "center", valign: "middle", fontFace: BODY, fontSize: 13, color: ACCENT });
  });
  s.addText("学び：課題を客観的に捉え、泥臭く改善を重ねることの重要性", { x: 0.9, y: 6.25, w: 11.5, h: 0.5,
    align: "center", fontFace: HEAD, fontSize: 15, bold: true, italic: true, color: PRIM_D });
  pageNum(s, 7);
}

// =================================================================
// Slide 8 — Closing (dark)
// =================================================================
{
  const s = p.addSlide();
  s.background = { color: NAVY };
  s.addShape(p.ShapeType.ellipse, { x: -2.3, y: 4.3, w: 6, h: 6, fill: { color: NAVY2 }, line: { type: "none" } });
  s.addShape(p.ShapeType.ellipse, { x: 10.6, y: -2.4, w: 5.2, h: 5.2, fill: { color: PRIM_D }, line: { type: "none" } });

  s.addText("SUMMARY", { x: 0.9, y: 1.0, w: 8, h: 0.4, fontFace: BODY, fontSize: 13, bold: true, color: ACCENT, charSpacing: 3 });
  s.addText("私の3つの強み", { x: 0.85, y: 1.45, w: 11, h: 1.0, fontFace: HEAD, fontSize: 44, bold: true, color: WHITE });

  const items = [
    ["01", "課題の本質を見極める力", "多角的にヒアリングし、真因を特定してから動く"],
    ["02", "粘り強い実行力", "改善策を最後までやり切り、数値で成果を出す"],
    ["03", "巻き込み力", "共通の目標へ組織の一体感を醸成する"],
  ];
  const cw = 3.65, cx0 = 0.9, cgap = 0.3, cy = 2.95, ch = 2.55;
  items.forEach((it, i) => {
    const x = cx0 + i * (cw + cgap);
    s.addShape(p.ShapeType.roundRect, { x, y: cy, w: cw, h: ch, rectRadius: 0.1,
      fill: { color: NAVY2 }, line: { type: "none" }, shadow: sh() });
    s.addText(it[0], { x: x + 0.35, y: cy + 0.28, w: 2, h: 0.7, fontFace: HEAD, fontSize: 34, bold: true, color: ACCENT });
    s.addText(it[1], { x: x + 0.35, y: cy + 1.05, w: cw - 0.7, h: 0.8, fontFace: HEAD, fontSize: 17, bold: true, color: WHITE, lineSpacingMultiple: 1.1 });
    s.addText(it[2], { x: x + 0.35, y: cy + 1.85, w: cw - 0.7, h: 0.6, fontFace: BODY, fontSize: 11.5, color: "B7C7D6", lineSpacingMultiple: 1.2 });
  });

  s.addText("課題に対して多角的にアプローチし、泥臭く解決まで実行する力を貴社で発揮します。",
    { x: 0.9, y: 5.95, w: 11.5, h: 0.6, fontFace: HEAD, fontSize: 16, bold: true, italic: true, color: "CADCEC" });
  s.addText("山田 太郎　｜　◯◯大学 経済学部 経営学科", { x: 0.9, y: 6.7, w: 11.5, h: 0.4, fontFace: BODY, fontSize: 12, color: "8FA6B6" });
}

p.writeFile({ fileName: "/home/user/Procson/slides_work/entry_sheet_slides.pptx" }).then(f => console.log("Saved:", f));
