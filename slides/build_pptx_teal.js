// 就活スライド .pptx（ティール・テンプレート版 / 山田太郎ES）
const pptxgen = require("pptxgenjs");
const P = {
  TEAL:"178F86", TEAL_DARK:"0F6B64", TEAL_DEEP:"0B4F4A", CHARCOAL:"26302F",
  TINT:"E6F4F2", TINT2:"D2E9E6", INK:"1E2A28", TEXT:"3D4744", MUTED:"8A9794",
  BORDER:"E1EAE8", ON_TEAL:"BFE6E2", QUOTE:"7FD8D1", WHITE:"FFFFFF",
};
const FONT = "Meiryo";
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
const PW = 13.33, PH = 7.5, ML = 0.6, MR = 0.6, MT = 0.44;

function head(slide, jp, en, num){
  slide.background = { color: P.WHITE };
  // 左上の斜めアクセント（淡いティール三角）
  slide.addShape(pres.ShapeType.triangle, { x:-0.9, y:-1.35, w:2.6, h:2.6, rotate:270, fill:{color:P.TEAL, transparency:88}, line:{type:"none"} });
  slide.addText(jp, { x:ML, y:MT-0.06, w:5.2, h:0.5, fontFace:FONT, fontSize:26, bold:true, color:P.INK, align:"left", valign:"middle", margin:0 });
  slide.addText(en, { x:ML+0.02, y:MT+0.44, w:5.2, h:0.28, fontFace:FONT, fontSize:12, bold:true, color:P.MUTED, charSpacing:4, align:"left", valign:"middle", margin:0 });
  // 見出し横のブラックの横棒
  const barX = ML + jp.length*0.46 + 0.35, barEnd = PW - MR - 0.85;
  slide.addShape(pres.ShapeType.roundRect, { x:barX, y:MT+0.14, w:Math.max(0.5, barEnd-barX), h:0.06, rectRadius:0.03, fill:{color:P.INK}, line:{type:"none"} });
  // 右上の番号サークル
  slide.addShape(pres.ShapeType.ellipse, { x:PW-MR-0.62, y:MT-0.08, w:0.6, h:0.6, fill:{color:P.TEAL}, line:{type:"none"}, shadow:{type:"outer", color:"0F6B64", opacity:0.3, blur:8, offset:3, angle:90} });
  slide.addText(num, { x:PW-MR-0.62, y:MT-0.08, w:0.6, h:0.6, fontFace:FONT, fontSize:20, bold:true, color:P.WHITE, align:"center", valign:"middle", margin:0 });
}
const runs = (arr, base, emSize) => arr.map((r)=>({ text:r.t, options:{ fontSize:r.em?emSize:base, color:r.em?P.TEAL:P.TEXT, bold:!!r.em||undefined } }));
const shadowTeal = ()=>({ type:"outer", color:"0F6B64", opacity:0.24, blur:9, offset:4, angle:90 });

// ① 自己紹介
(()=>{
  const slide = pres.addSlide(); head(slide,"自己紹介","ABOUT ME","01");
  const cx=ML, cy=1.6, cw=3.72, ch=2.9;
  slide.addShape(pres.ShapeType.roundRect, { x:cx, y:cy, w:cw, h:ch, rectRadius:0.14, fill:{color:P.TEAL}, line:{type:"none"}, shadow:shadowTeal() });
  slide.addShape(pres.ShapeType.rtTriangle, { x:cx+cw-1.2, y:cy+ch-1.2, w:1.2, h:1.2, flipH:true, fill:{color:P.TEAL_DEEP, transparency:45}, line:{type:"none"} });
  slide.addShape(pres.ShapeType.ellipse, { x:cx+cw-1.05, y:cy+ch-1.05, w:0.85, h:0.85, fill:{type:"none"}, line:{color:P.WHITE, width:5, transparency:70} });
  slide.addText([
    { text:"◯◯大学　経済学部", options:{fontSize:15, color:"EAF6F4", breakLine:true} },
    { text:"経営学科（202X年卒予定）", options:{fontSize:15, color:"EAF6F4"} },
  ], { x:cx+0.35, y:cy+0.3, w:cw-0.7, h:0.9, fontFace:FONT, align:"left", valign:"top", margin:0, lineSpacingMultiple:1.3 });
  slide.addText("N A M E", { x:cx+0.35, y:cy+1.35, w:cw-0.7, h:0.25, fontFace:FONT, fontSize:11, color:P.ON_TEAL, charSpacing:3, align:"left", valign:"middle", margin:0 });
  slide.addText("山田 太郎", { x:cx+0.35, y:cy+1.6, w:cw-0.7, h:0.7, fontFace:FONT, fontSize:34, bold:true, color:P.WHITE, align:"left", valign:"middle", margin:0 });
  slide.addText("YAMADA　TARO", { x:cx+0.35, y:cy+2.32, w:cw-0.7, h:0.3, fontFace:FONT, fontSize:11, color:P.ON_TEAL, charSpacing:2, align:"left", valign:"middle", margin:0 });
  let tx=cx, ty=cy+ch+0.22; const th=0.42;
  ["# 経営学科","# Webマーケサークル","# 企画営業・PM志望"].forEach((t)=>{
    const tw=0.34+t.length*0.135;
    slide.addShape(pres.ShapeType.roundRect, { x:tx, y:ty, w:tw, h:th, rectRadius:0.21, fill:{color:P.TINT}, line:{color:P.TINT2, width:1} });
    slide.addText(t, { x:tx, y:ty, w:tw, h:th, fontFace:FONT, fontSize:12, bold:true, color:P.TEAL_DARK, align:"center", valign:"middle", margin:0 });
    tx+=tw+0.14; if(tx+1.6>cx+cw+0.1){ tx=cx; ty+=th+0.14; }
  });
  const rx=4.8, rw=PW-MR-(rx+0.85);
  const rows=[
    { n:"01", h:"専攻・学び", body:[{t:"経営学科で"},{t:"マーケティングと経営",em:true},{t:"を学び、ビジネスを俯瞰する視点を養成。"}] },
    { n:"02", h:"関心を持ったきっかけ", body:[{t:"インターンで中小企業の業務の煩雑さに触れ、"},{t:"DXの必要性",em:true},{t:"を痛感。"}] },
    { n:"03", h:"力を入れていること", body:[{t:"Webマーケサークルで飲食店のSNS集客を支援し、"},{t:"来店数を前年比150%",em:true},{t:"に。"}] },
  ];
  let ry=2.0;
  rows.forEach((r)=>{
    slide.addShape(pres.ShapeType.hexagon, { x:rx, y:ry, w:0.62, h:0.62, fill:{color:P.TEAL}, line:{type:"none"} });
    slide.addText(r.n, { x:rx, y:ry, w:0.62, h:0.62, fontFace:FONT, fontSize:17, bold:true, color:P.WHITE, align:"center", valign:"middle", margin:0 });
    slide.addText(r.h, { x:rx+0.85, y:ry-0.08, w:rw, h:0.36, fontFace:FONT, fontSize:15, bold:true, color:P.INK, align:"left", valign:"middle", margin:0 });
    slide.addText(runs(r.body,15,17), { x:rx+0.85, y:ry+0.28, w:rw, h:0.75, fontFace:FONT, align:"left", valign:"top", margin:0, lineSpacingMultiple:1.2 });
    ry+=1.4;
  });
})();

// ② 志望動機
(()=>{
  const slide = pres.addSlide(); head(slide,"志望動機","MOTIVATION","02");
  slide.addText("MY MOTIVATION", { x:0, y:1.85, w:PW, h:0.4, fontFace:FONT, fontSize:14, bold:true, color:P.TEAL, charSpacing:3, align:"center", valign:"middle" });
  slide.addText([
    { text:"業務の効率化を通じて、", options:{ color:P.INK, breakLine:true } },
    { text:"人が", options:{ color:P.INK } },
    { text:"創造的な仕事に集中できる社会", options:{ color:P.TEAL } },
    { text:"へ。", options:{ color:P.INK } },
  ], { x:1.0, y:2.55, w:PW-2.0, h:1.7, fontFace:FONT, fontSize:36, bold:true, align:"center", valign:"top", lineSpacingMultiple:1.35 });
  const nx=3.0, nw=PW-6.0, ny=5.0, nh=1.35;
  slide.addShape(pres.ShapeType.roundRect, { x:nx, y:ny, w:nw, h:nh, rectRadius:0.12, fill:{color:P.TEAL}, line:{type:"none"}, shadow:shadowTeal() });
  slide.addShape(pres.ShapeType.triangle, { x:nx+nw-1.1, y:ny, w:1.1, h:1.1, rotate:90, fill:{color:P.TEAL_DEEP, transparency:55}, line:{type:"none"} });
  slide.addText("── 補足", { x:nx+0.5, y:ny+0.22, w:nw-1.2, h:0.3, fontFace:FONT, fontSize:13, bold:true, color:P.ON_TEAL, charSpacing:1, align:"left", valign:"middle", margin:0 });
  slide.addText("DX支援の実績と革新的なソリューションに共感したため。", { x:nx+0.5, y:ny+0.56, w:nw-1.2, h:0.6, fontFace:FONT, fontSize:18, bold:true, color:P.WHITE, align:"left", valign:"middle", margin:0 });
})();

// ③ 自己PR
(()=>{
  const slide = pres.addSlide(); head(slide,"自己PR","STRENGTH","03");
  const sx=ML, sy=1.6, sw=PW-ML-MR, sh=1.6;
  slide.addShape(pres.ShapeType.roundRect, { x:sx, y:sy, w:sw, h:sh, rectRadius:0.14, fill:{color:P.CHARCOAL}, line:{type:"none"}, shadow:{type:"outer", color:"14201E", opacity:0.26, blur:9, offset:4, angle:90} });
  slide.addShape(pres.ShapeType.rtTriangle, { x:sx+0.02, y:sy+0.02, w:1.3, h:sh-0.04, flipV:true, fill:{color:P.TEAL}, line:{type:"none"} });
  slide.addShape(pres.ShapeType.rtTriangle, { x:sx+sw-1.1, y:sy+sh-1.06, w:1.08, h:1.04, flipH:true, fill:{color:P.TEAL, transparency:70}, line:{type:"none"} });
  slide.addText("MY STRENGTH ── 私の強み", { x:sx, y:sy+0.25, w:sw, h:0.3, fontFace:FONT, fontSize:13, color:P.ON_TEAL, charSpacing:2, align:"center", valign:"middle" });
  slide.addText([
    { text:"「", options:{ color:P.QUOTE } },
    { text:"課題の本質を見極め、粘り強く解決に向けて行動する力", options:{ color:P.WHITE } },
    { text:"」", options:{ color:P.QUOTE } },
  ], { x:sx+0.3, y:sy+0.6, w:sw-0.6, h:0.85, fontFace:FONT, fontSize:26, bold:true, align:"center", valign:"middle" });
  const gy=sy+sh+0.4, gh=2.5, ggap=0.4, gw=(sw-ggap)/2;
  const cards=[
    { icon:"◎", head:"根拠となる経験", deep:false, body:[{t:"カフェの新人離職率を、"},{t:"40%→10%以下",em:true},{t:"に改善。"}] },
    { icon:"➜", head:"入社後の活かし方", deep:true, body:[{t:"課題に"},{t:"多角的に迫り",em:true},{t:"、泥臭く実行して貢献。"}] },
  ];
  cards.forEach((c,i)=>{
    const x=sx+i*(gw+ggap);
    slide.addShape(pres.ShapeType.roundRect, { x, y:gy, w:gw, h:gh, rectRadius:0.1, fill:{color:P.WHITE}, line:{color:P.BORDER, width:1.5}, shadow:{type:"outer", color:"14403A", opacity:0.10, blur:8, offset:2, angle:90} });
    slide.addShape(pres.ShapeType.hexagon, { x:x+0.32, y:gy+0.4, w:0.55, h:0.55, fill:{color:c.deep?P.CHARCOAL:P.TEAL}, line:{type:"none"} });
    slide.addText(c.icon, { x:x+0.32, y:gy+0.4, w:0.55, h:0.55, fontFace:FONT, fontSize:18, bold:true, color:P.WHITE, align:"center", valign:"middle", margin:0 });
    slide.addText(c.head, { x:x+1.05, y:gy+0.42, w:gw-1.35, h:0.5, fontFace:FONT, fontSize:16, bold:true, color:P.INK, align:"left", valign:"middle", margin:0 });
    slide.addText(runs(c.body,17,18).map((r)=>({ ...r, options:{ ...r.options, bold:true } })), { x:x+0.4, y:gy+1.15, w:gw-0.8, h:gh-1.35, fontFace:FONT, align:"left", valign:"top", margin:0, lineSpacingMultiple:1.3 });
  });
})();

pres.writeFile({ fileName:"/home/user/Procson/slides/es_yamada_teal.pptx" }).then((f)=>console.log("wrote",f));
