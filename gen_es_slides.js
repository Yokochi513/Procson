const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
const W = 13.3, H = 7.5;

// ---- Palette (appetizing food theme) ----
const ESPRESSO = "2B1712"; // deep dark bg
const CREAM    = "FDF6EC"; // light bg
const TERRA    = "D9603B"; // terracotta / coral accent
const GOLD     = "E8A54B"; // warm gold
const SAGE     = "7FA37E"; // sage green
const INK      = "3A2A22"; // dark text
const MUTE     = "8A756A"; // muted text
const CARD     = "FFFFFF"; // card bg

const SERIF = "Cambria";
const SANS  = "Calibri";

function bg(slide, color){ slide.background = { color }; }

// number badge (circle) helper
function badge(slide, x, y, num, fill, txtColor){
  slide.addShape(pres.ShapeType.ellipse, { x, y, w:0.62, h:0.62, fill:{color:fill} });
  slide.addText(String(num), { x, y, w:0.62, h:0.62, align:"center", valign:"middle",
    fontFace:SERIF, fontSize:24, bold:true, color:txtColor });
}

// ========== 1. TITLE ==========
let s = pres.addSlide(); bg(s, ESPRESSO);
// warm accent blocks (motif: rounded plate shapes)
s.addShape(pres.ShapeType.ellipse, { x:10.1, y:-1.6, w:5.2, h:5.2, fill:{color:TERRA, transparency:82} });
s.addShape(pres.ShapeType.ellipse, { x:11.3, y:4.4, w:3.6, h:3.6, fill:{color:GOLD, transparency:85} });

s.addText("FOOD MAKER  ·  ENTRY SHEET", { x:0.9, y:1.35, w:9, h:0.4,
  fontFace:SANS, fontSize:14, bold:true, color:GOLD, charSpacing:3 });
s.addText([
  { text:"食品メーカー向け", options:{ breakLine:true } },
  { text:"エントリーシート 作成ガイド", options:{} },
], { x:0.85, y:1.85, w:11, h:2.1, fontFace:SERIF, fontSize:46, bold:true, color:"FFFFFF", lineSpacingMultiple:1.05 });

s.addText("選考で高評価を得るための「志望動機・ガクチカ・自己PR・商品提案・キャリアプラン」— 5つの必須項目を、例文と採用担当者の視点で解説。",
  { x:0.9, y:4.35, w:8.6, h:1.0, fontFace:SANS, fontSize:16, color:"E9D9CC", lineSpacingMultiple:1.25 });

// bottom key stats row
const kt = [["5","必須項目"],["400","字目安 / 項目"],["1","チェックリスト"]];
kt.forEach((k,i)=>{
  const x = 0.9 + i*3.0;
  s.addText(k[0], { x, y:5.75, w:1.6, h:0.9, fontFace:SERIF, fontSize:44, bold:true, color:TERRA, align:"left" });
  s.addText(k[1], { x:x+0.06, y:6.65, w:2.6, h:0.4, fontFace:SANS, fontSize:13, color:"E9D9CC", align:"left" });
});

// ========== 2. OVERVIEW / AGENDA ==========
s = pres.addSlide(); bg(s, CREAM);
s.addText("ESで問われる5つの必須項目", { x:0.85, y:0.55, w:11.6, h:0.8, fontFace:SERIF, fontSize:34, bold:true, color:INK });
s.addText("それぞれで「なぜ食か・なぜその会社か」を、原体験と数字で語ることが評価の分かれ目。",
  { x:0.87, y:1.35, w:11.6, h:0.5, fontFace:SANS, fontSize:15, color:MUTE });

const items = [
  ["1","志望動機","原体験 × 企業理解 × 入社後の貢献イメージ", TERRA],
  ["2","ガクチカ","STAR法で課題→行動→定量成果を論理的に", GOLD],
  ["3","自己PR","強みを具体エピソードと再現性で裏づける", SAGE],
  ["4","商品提案","愛着 × 市場トレンドに基づく建設的な提案", TERRA],
  ["5","キャリアプラン","短期の下積み〜中長期の目標を一本の線で", GOLD],
];
// 2 rows: 3 on top, 2 bottom — use consistent card grid (3 cols)
const cw = 3.75, ch = 2.15, gx = 0.35, gy = 0.35, ox = 0.85, oy = 2.15;
items.forEach((it,i)=>{
  const col = i % 3, row = Math.floor(i/3);
  const x = ox + col*(cw+gx), y = oy + row*(ch+gy);
  s.addShape(pres.ShapeType.roundRect, { x, y, w:cw, h:ch, rectRadius:0.1, fill:{color:CARD},
    line:{color:"EADFD3", width:1}, shadow:{ type:"outer", color:"C9B8A8", blur:7, offset:3, angle:90, opacity:0.45 } });
  badge(s, x+0.3, y+0.32, it[0], it[3], "FFFFFF");
  s.addText(it[1], { x:x+1.05, y:y+0.34, w:cw-1.3, h:0.6, fontFace:SERIF, fontSize:20, bold:true, color:INK, valign:"middle" });
  s.addText(it[2], { x:x+0.32, y:y+1.15, w:cw-0.6, h:0.85, fontFace:SANS, fontSize:13.5, color:MUTE, lineSpacingMultiple:1.2 });
});

// ---- Content slide builder ----
// left rail label + title example + quote; right: eval point cards
function contentSlide(num, section, exTitle, quoteLines, points, accent){
  const sl = pres.addSlide(); bg(sl, CREAM);
  // header
  badge(sl, 0.85, 0.55, num, accent, "FFFFFF");
  sl.addText(section, { x:1.65, y:0.5, w:8.5, h:0.72, fontFace:SERIF, fontSize:32, bold:true, color:INK, valign:"middle" });
  sl.addText("EXAMPLE & EVALUATION", { x:9.7, y:0.72, w:2.9, h:0.35, align:"right",
    fontFace:SANS, fontSize:11, bold:true, color:MUTE, charSpacing:2 });

  // LEFT: example card
  const lx=0.85, ly=1.6, lw=6.55, lh=5.35;
  sl.addShape(pres.ShapeType.roundRect, { x:lx, y:ly, w:lw, h:lh, rectRadius:0.1, fill:{color:ESPRESSO} });
  sl.addText("例文タイトル", { x:lx+0.4, y:ly+0.35, w:lw-0.8, h:0.35, fontFace:SANS, fontSize:12, bold:true, color:GOLD, charSpacing:2 });
  sl.addText(exTitle, { x:lx+0.4, y:ly+0.72, w:lw-0.8, h:1.15, fontFace:SERIF, fontSize:20, bold:true, color:"FFFFFF", lineSpacingMultiple:1.1 });
  // divider dot row instead of line-under-title (avoid accent stripes) -> use small quote mark
  sl.addText("“", { x:lx+0.3, y:ly+1.95, w:0.9, h:0.9, fontFace:SERIF, fontSize:54, bold:true, color:accent });
  sl.addText(quoteLines, { x:lx+0.4, y:ly+2.65, w:lw-0.8, h:2.4, fontFace:SANS, fontSize:13.5, color:"EAD9CB", lineSpacingMultiple:1.28 });

  // RIGHT: eval points
  const rx=7.7, rw=4.75;
  sl.addText("採用担当者が評価するポイント", { x:rx, y:1.6, w:rw, h:0.4, fontFace:SANS, fontSize:13, bold:true, color:accent });
  const startY=2.15, cardH=(5.35-0.55)/points.length - 0.22;
  points.forEach((p,i)=>{
    const y = startY + i*(cardH+0.22);
    sl.addShape(pres.ShapeType.roundRect, { x:rx, y, w:rw, h:cardH, rectRadius:0.08, fill:{color:CARD},
      line:{color:"EADFD3", width:1}, shadow:{ type:"outer", color:"C9B8A8", blur:6, offset:2, angle:90, opacity:0.4 } });
    sl.addShape(pres.ShapeType.ellipse, { x:rx+0.28, y:y+cardH/2-0.19, w:0.38, h:0.38, fill:{color:accent} });
    sl.addText("✓", { x:rx+0.28, y:y+cardH/2-0.19, w:0.38, h:0.38, align:"center", valign:"middle", fontFace:SANS, fontSize:15, bold:true, color:"FFFFFF" });
    sl.addText([
      { text:p[0]+"\n", options:{ fontSize:14.5, bold:true, color:INK, breakLine:true } },
      { text:p[1], options:{ fontSize:12, color:MUTE } },
    ], { x:rx+0.82, y:y+0.16, w:rw-1.05, h:cardH-0.3, fontFace:SANS, valign:"middle", lineSpacingMultiple:1.15, margin:0 });
  });
  return sl;
}

// ========== 3. 志望動機 ==========
contentSlide(1, "志望動機",
  "食を通じて「健康と笑顔」を毎日の食卓に届けたい",
  "健康上の理由で食事制限を経験し、食が心の豊かさや活力に与える影響の大きさを実感。「美味しさ」と「高い栄養価値」を両立する貴社に共感し、マーケティング職として新たな『食習慣』を提案し、より多くの食卓へ届ける架け橋になりたい。",
  [
    ["原体験との結びつき","なぜ食・なぜ健康領域なのかに説得力を持たせる"],
    ["企業・商品への深い理解","特定の商品名を挙げ、強み・魅力を言語化する"],
    ["入社後の貢献イメージ","職種とやりたいことを明確に結びつける"],
  ], TERRA);

// ========== 4. ガクチカ ==========
contentSlide(2, "ガクチカ（学生時代に力を入れたこと）",
  "ニーズ分析に基づく新商品提案で店舗売上を20%向上",
  "夕方の来店客数の伸び悩みと廃棄ロスに着目。顧客ヒアリングから『手軽な軽食』需要を発見し、余剰パン生地を活かした一口デリパンを店長と商品化。夕方客数25%増・食品ロス30%削減・店舗売上20%向上を実現した。",
  [
    ["STAR法の徹底","状況→課題→行動→結果が論理的につながる"],
    ["定量的な成果","25%増・30%削減など数値で客観性を持たせる"],
    ["食品業界との親和性","商品開発・ロス削減が現場に直結する強み"],
  ], GOLD);

// ========== 5. 自己PR ==========
contentSlide(3, "自己PR",
  "ニーズを汲み取り着実に形にする「粘り強い課題解決力」",
  "地域活性化サークルで商品企画のリーダーを担当。試作の評価が伸びず士気が低下する中、個別面談と主婦層100名への現地インタビューを実施。『調理時間の短縮』へコンセプトを再設計し、50回以上の試作の末に道の駅で完売する人気商品を完成させた。",
  [
    ["具体的な行動エピソード","100名インタビュー・50回試作で行動の密度を示す"],
    ["再現性の提示","強みが貴社の仕事でどう活きるかが明確"],
    ["巻き込み力","周囲を動かしチームで成果を出した点を訴求"],
  ], SAGE);

// ========== 6. 商品提案 ==========
contentSlide(4, "自社商品への想い・改善提案",
  "『○○』のZ世代向けパッケージ・容量最適化の提案",
  "幼少期から愛飲する代表商品の品質を魅力と捉えつつ、ファン層拡大へ『Z世代向けの小容量・個包装タイプ』を提案。単身世帯増加やタイパ志向を背景に、持ち運びやすくSNS映えする個食タイプで“パーソナルユース”の飲用シーンを創出する。",
  [
    ["リスペクトと客観的視点","愛着を示しつつ批判的にならず建設的に提案"],
    ["市場トレンドの把握","単身世帯増加・タイパ・個食など背景に基づく"],
    ["新シーンの創出","オフィスや学校での新たな利用機会を描く"],
  ], TERRA);

// ========== 7. キャリアプラン ==========
contentSlide(5, "入社後に挑戦したいこと",
  "食のグローバル展開で世界に新しい食体験を届ける",
  "東南アジア留学で高品質な加工食品へのニーズの高まりを実感。1〜2年目は国内営業で店舗マーケティングと商談の基礎を磨き、その後は海外事業部で現地パートナーと協働し販路開拓。『日本の美味しい食』を世界基準にし、グローバルシェア拡大に貢献する。",
  [
    ["短期・中長期のステップ","下積みから目標までロードマップを描く"],
    ["企業の成長戦略との合致","海外展開など事業方針と目指す姿が一致"],
    ["リアリティ","具体的な年次計画で説得力を持たせる"],
  ], GOLD);

// ========== 8. CHECKLIST ==========
s = pres.addSlide(); bg(s, ESPRESSO);
s.addShape(pres.ShapeType.ellipse, { x:-1.5, y:5.0, w:4.5, h:4.5, fill:{color:GOLD, transparency:86} });
s.addText("提出前チェックリスト", { x:0.85, y:0.6, w:11.6, h:0.8, fontFace:SERIF, fontSize:34, bold:true, color:"FFFFFF" });
s.addText("この5点を満たせば、他社でも言える“ありきたりなES”から抜け出せる。", { x:0.87, y:1.4, w:11.6, h:0.5, fontFace:SANS, fontSize:15, color:"E9D9CC" });

const checks = [
  ["なぜ「食」・なぜ「その会社」か","他社でも言える内容になっていないか区別する"],
  ["ビジネスとしての視点","商品愛だけでなく顧客・市場・利益の観点を含む"],
  ["数字で具体化","人数・期間・パーセンテージで表現できているか"],
  ["結論ファースト（PREP法）","読みやすい構成で結論から書けているか"],
  ["文字数の充足","指定字数の8〜9割以上を埋められているか"],
];
const ckY=2.2, cH=0.86, cGap=0.14, cX=0.85, cWid=11.6;
checks.forEach((c,i)=>{
  const y=ckY+i*(cH+cGap);
  s.addShape(pres.ShapeType.roundRect, { x:cX, y, w:cWid, h:cH, rectRadius:0.08, fill:{color:"3A241C"} });
  s.addShape(pres.ShapeType.roundRect, { x:cX+0.22, y:y+cH/2-0.24, w:0.48, h:0.48, rectRadius:0.06, fill:{color:TERRA} });
  s.addText("✓", { x:cX+0.22, y:y+cH/2-0.24, w:0.48, h:0.48, align:"center", valign:"middle", fontFace:SANS, fontSize:20, bold:true, color:"FFFFFF" });
  s.addText([
    { text:c[0]+"   ", options:{ fontSize:16, bold:true, color:"FFFFFF" } },
    { text:c[1], options:{ fontSize:13, color:"D7C3B4" } },
  ], { x:cX+0.95, y, w:cWid-1.2, h:cH, valign:"middle", fontFace:SANS, margin:0 });
});

// ========== 9. CLOSING ==========
s = pres.addSlide(); bg(s, CREAM);
s.addShape(pres.ShapeType.ellipse, { x:9.6, y:-2.0, w:6, h:6, fill:{color:TERRA, transparency:88} });
s.addText("採用担当者は「あなたらしさ」を見ている", { x:0.9, y:2.55, w:11.4, h:1.0, fontFace:SERIF, fontSize:34, bold:true, color:INK });
s.addText("原体験 × 企業理解 × 数字。この3つを一本の線でつなぎ、あなただけのESを完成させよう。",
  { x:0.9, y:3.7, w:10.8, h:0.9, fontFace:SANS, fontSize:17, color:MUTE, lineSpacingMultiple:1.3 });
s.addShape(pres.ShapeType.roundRect, { x:0.9, y:4.9, w:2.9, h:0.7, rectRadius:0.35, fill:{color:TERRA} });
s.addText("食を、あなたの言葉で。", { x:0.9, y:4.9, w:2.9, h:0.7, align:"center", valign:"middle", fontFace:SANS, fontSize:14, bold:true, color:"FFFFFF" });

pres.writeFile({ fileName: "食品メーカーES作成ガイド.pptx" }).then(f=>console.log("Wrote", f));
