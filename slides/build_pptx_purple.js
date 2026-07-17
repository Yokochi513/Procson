// 就活スライド .pptx（パープル・テンプレート版 / 山田太郎ES）
const pptxgen = require("pptxgenjs");
const P = {
  PURPLE:"6A34F0", PURPLE2:"5A23D6", DEEP:"2E1C6E", INK:"241D3D", TEXT:"4B4660",
  MUTED:"9A94AD", TINT:"F2EDFE", TINT2:"E7DCFB", SQ:"C9B8F7", BORDER:"EAE3F8",
  ACCENT_ON:"D9C9FB", WHITE:"FFFFFF",
};
const FONT = "Meiryo";
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
const PW = 13.33, PH = 7.5, ML = 0.6, MR = 0.6, MT = 0.5;

function deco(slide){
  slide.background = { color: P.WHITE };
  slide.addShape(pres.ShapeType.roundRect, { x: 11.35, y: 0.42, w: 0.28, h: 0.28, rectRadius: 0.04, fill:{color:P.PURPLE}, line:{type:"none"} });
  slide.addShape(pres.ShapeType.roundRect, { x: 11.72, y: 0.42, w: 0.28, h: 0.28, rectRadius: 0.04, fill:{color:P.TINT2}, line:{type:"none"} });
  slide.addShape(pres.ShapeType.roundRect, { x: 0.5, y: 6.4, w: 0.62, h: 0.62, rectRadius: 0.06, fill:{color:P.TINT}, line:{type:"none"} });
}
function title(slide, jp, en){
  slide.addShape(pres.ShapeType.roundRect, { x: ML+0.06, y: MT+0.08, w: 0.26, h: 0.26, rectRadius:0.05, fill:{color:P.TINT2}, line:{type:"none"} });
  slide.addShape(pres.ShapeType.roundRect, { x: ML, y: MT+0.02, w: 0.26, h: 0.26, rectRadius:0.05, fill:{color:P.PURPLE}, line:{type:"none"} });
  slide.addText(jp, { x: ML+0.44, y: MT-0.12, w: 6, h: 0.55, fontFace:FONT, fontSize:26, bold:true, color:P.INK, align:"left", valign:"middle", margin:0 });
  slide.addText(en, { x: ML+0.44+jp.length*0.42+0.3, y: MT+0.06, w: 3, h: 0.4, fontFace:FONT, fontSize:12, bold:true, color:P.MUTED, charSpacing:3, align:"left", valign:"middle", margin:0 });
}
const runs = (arr, base, emSize) => arr.map((r)=>({ text:r.t, options:{ fontSize:r.em?emSize:base, color:r.em?P.PURPLE:P.TEXT, bold:!!r.em||undefined } }));
const shadow = (o)=>({ type:"outer", color:"5A23D6", opacity:0.26, blur:9, offset:4, angle:90, ...o });

// ① 自己紹介
(()=>{
  const slide = pres.addSlide(); deco(slide); title(slide,"自己紹介","ABOUT ME");
  const cx=ML, cy=1.55, cw=3.72, ch=2.9;
  slide.addShape(pres.ShapeType.roundRect, { x:cx, y:cy, w:cw, h:ch, rectRadius:0.16, fill:{color:P.PURPLE}, line:{type:"none"}, shadow:shadow() });
  slide.addShape(pres.ShapeType.ellipse, { x:cx+cw-1.15, y:cy+0.15, w:1.0, h:1.0, fill:{color:P.WHITE, transparency:88}, line:{type:"none"} });
  slide.addText([
    { text:"◯◯大学　経済学部", options:{fontSize:15, color:"F1ECFE", breakLine:true} },
    { text:"経営学科（202X年卒予定）", options:{fontSize:15, color:"F1ECFE"} },
  ], { x:cx+0.35, y:cy+0.3, w:cw-0.7, h:0.9, fontFace:FONT, align:"left", valign:"top", margin:0, lineSpacingMultiple:1.3 });
  slide.addText("N A M E", { x:cx+0.35, y:cy+1.35, w:cw-0.7, h:0.25, fontFace:FONT, fontSize:11, color:P.ACCENT_ON, charSpacing:3, align:"left", valign:"middle", margin:0 });
  slide.addText("山田 太郎", { x:cx+0.35, y:cy+1.6, w:cw-0.7, h:0.7, fontFace:FONT, fontSize:34, bold:true, color:P.WHITE, align:"left", valign:"middle", margin:0 });
  slide.addText("YAMADA　TARO", { x:cx+0.35, y:cy+2.32, w:cw-0.7, h:0.3, fontFace:FONT, fontSize:11, color:P.ACCENT_ON, charSpacing:2, align:"left", valign:"middle", margin:0 });
  let tx=cx, ty=cy+ch+0.22; const th=0.42;
  ["# 経営学科","# Webマーケサークル","# 企画営業・PM志望"].forEach((t)=>{
    const tw=0.34+t.length*0.135;
    slide.addShape(pres.ShapeType.roundRect, { x:tx, y:ty, w:tw, h:th, rectRadius:0.21, fill:{color:P.TINT}, line:{color:P.TINT2, width:1} });
    slide.addText(t, { x:tx, y:ty, w:tw, h:th, fontFace:FONT, fontSize:12, bold:true, color:P.PURPLE2, align:"center", valign:"middle", margin:0 });
    tx+=tw+0.14; if(tx+1.6>cx+cw+0.1){ tx=cx; ty+=th+0.14; }
  });
  const rx=4.8, rw=PW-MR-(rx+0.8);
  const rows=[
    { n:"01", h:"専攻・学び", body:[{t:"経営学科で"},{t:"マーケティングと経営",em:true},{t:"を学び、ビジネスを俯瞰する視点を養成。"}] },
    { n:"02", h:"関心を持ったきっかけ", body:[{t:"インターンで中小企業の業務の煩雑さに触れ、"},{t:"DXの必要性",em:true},{t:"を痛感。"}] },
    { n:"03", h:"力を入れていること", body:[{t:"Webマーケサークルで飲食店のSNS集客を支援し、"},{t:"来店数を前年比150%",em:true},{t:"に。"}] },
  ];
  let ry=1.95;
  rows.forEach((r)=>{
    slide.addShape(pres.ShapeType.ellipse, { x:rx, y:ry, w:0.6, h:0.6, fill:{color:P.TINT}, line:{color:P.SQ, width:2} });
    slide.addText(r.n, { x:rx, y:ry, w:0.6, h:0.6, fontFace:FONT, fontSize:19, bold:true, color:P.PURPLE, align:"center", valign:"middle", margin:0 });
    slide.addText(r.h, { x:rx+0.8, y:ry-0.06, w:rw, h:0.36, fontFace:FONT, fontSize:15, bold:true, color:P.INK, align:"left", valign:"middle", margin:0 });
    slide.addText(runs(r.body,15,17), { x:rx+0.8, y:ry+0.3, w:rw, h:0.75, fontFace:FONT, align:"left", valign:"top", margin:0, lineSpacingMultiple:1.2 });
    ry+=1.4;
  });
})();

// ② 志望動機
(()=>{
  const slide = pres.addSlide(); deco(slide); title(slide,"志望動機","MOTIVATION");
  slide.addText("MY MOTIVATION", { x:0, y:1.8, w:PW, h:0.4, fontFace:FONT, fontSize:14, bold:true, color:P.PURPLE, charSpacing:3, align:"center", valign:"middle" });
  slide.addText([
    { text:"業務の効率化を通じて、", options:{ color:P.INK, breakLine:true } },
    { text:"人が", options:{ color:P.INK } },
    { text:"創造的な仕事に集中できる社会", options:{ color:P.PURPLE } },
    { text:"へ。", options:{ color:P.INK } },
  ], { x:1.0, y:2.55, w:PW-2.0, h:1.7, fontFace:FONT, fontSize:36, bold:true, align:"center", valign:"top", lineSpacingMultiple:1.35 });
  const nx=3.0, nw=PW-6.0, ny=5.0, nh=1.35;
  slide.addShape(pres.ShapeType.roundRect, { x:nx, y:ny, w:nw, h:nh, rectRadius:0.14, fill:{color:P.PURPLE}, line:{type:"none"}, shadow:shadow() });
  slide.addShape(pres.ShapeType.ellipse, { x:nx+0.05, y:ny+nh-0.75, w:1.0, h:1.0, fill:{color:P.WHITE, transparency:90}, line:{type:"none"} });
  slide.addText("── 補足", { x:nx+0.5, y:ny+0.22, w:nw-1.0, h:0.3, fontFace:FONT, fontSize:13, bold:true, color:"E4DAFB", charSpacing:1, align:"left", valign:"middle", margin:0 });
  slide.addText("DX支援の実績と革新的なソリューションに共感したため。", { x:nx+0.5, y:ny+0.56, w:nw-1.0, h:0.6, fontFace:FONT, fontSize:18, bold:true, color:P.WHITE, align:"left", valign:"middle", margin:0 });
})();

// ③ 自己PR
(()=>{
  const slide = pres.addSlide(); deco(slide); title(slide,"自己PR","STRENGTH");
  const sx=ML, sy=1.6, sw=PW-ML-MR, sh=1.6;
  slide.addShape(pres.ShapeType.roundRect, { x:sx, y:sy, w:sw, h:sh, rectRadius:0.16, fill:{color:P.PURPLE}, line:{type:"none"}, shadow:shadow() });
  slide.addShape(pres.ShapeType.ellipse, { x:sx+sw-1.5, y:sy-0.4, w:1.7, h:1.7, fill:{color:P.WHITE, transparency:90}, line:{type:"none"} });
  slide.addText("MY STRENGTH ── 私の強み", { x:sx, y:sy+0.25, w:sw, h:0.3, fontFace:FONT, fontSize:13, color:P.ACCENT_ON, charSpacing:2, align:"center", valign:"middle" });
  slide.addText([
    { text:"「", options:{ color:P.ACCENT_ON } },
    { text:"課題の本質を見極め、粘り強く解決に向けて行動する力", options:{ color:P.WHITE } },
    { text:"」", options:{ color:P.ACCENT_ON } },
  ], { x:sx+0.3, y:sy+0.6, w:sw-0.6, h:0.85, fontFace:FONT, fontSize:26, bold:true, align:"center", valign:"middle" });
  const gy=sy+sh+0.4, gh=2.5, ggap=0.4, gw=(sw-ggap)/2;
  const cards=[
    { icon:"◎", head:"根拠となる経験", deep:false, body:[{t:"カフェの新人離職率を、"},{t:"40%→10%以下",em:true},{t:"に改善。"}] },
    { icon:"➜", head:"入社後の活かし方", deep:true, body:[{t:"課題に"},{t:"多角的に迫り",em:true},{t:"、泥臭く実行して貢献。"}] },
  ];
  cards.forEach((c,i)=>{
    const x=sx+i*(gw+ggap);
    slide.addShape(pres.ShapeType.roundRect, { x, y:gy, w:gw, h:gh, rectRadius:0.12, fill:{color:P.WHITE}, line:{color:P.BORDER, width:1.5}, shadow:{type:"outer", color:"3C286E", opacity:0.10, blur:8, offset:2, angle:90} });
    slide.addShape(pres.ShapeType.roundRect, { x:x+0.35, y:gy+0.42, w:0.5, h:0.5, rectRadius:0.05, fill:{color:P.TINT2}, line:{type:"none"} });
    slide.addShape(pres.ShapeType.ellipse, { x:x+0.32, y:gy+0.36, w:0.5, h:0.5, fill:{color:c.deep?P.DEEP:P.PURPLE}, line:{type:"none"} });
    slide.addText(c.icon, { x:x+0.32, y:gy+0.36, w:0.5, h:0.5, fontFace:FONT, fontSize:18, bold:true, color:P.WHITE, align:"center", valign:"middle", margin:0 });
    slide.addText(c.head, { x:x+1.0, y:gy+0.4, w:gw-1.3, h:0.5, fontFace:FONT, fontSize:16, bold:true, color:P.INK, align:"left", valign:"middle", margin:0 });
    slide.addText(runs(c.body,17,18).map((r)=>({ ...r, options:{ ...r.options, bold:true } })), { x:x+0.4, y:gy+1.15, w:gw-0.8, h:gh-1.35, fontFace:FONT, align:"left", valign:"top", margin:0, lineSpacingMultiple:1.3 });
  });
})();

pres.writeFile({ fileName:"/home/user/Procson/slides/es_yamada_purple.pptx" }).then((f)=>console.log("wrote",f));
