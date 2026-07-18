import { SlideTheme } from "./theme";

/**
 * ダミーのスライドHTML（APIキーが無いとき・静的配信のとき用）。
 * skill_es-presentation の3レイアウト（①自己紹介②志望動機③自己PR）と同じ構成の
 * サンプルに、選択されたテーマの配色だけを反映して返す。クライアント側でも使えるよう
 * ファイル読み込みはせず文字列として持つ。
 */
export function mockSlidesHtml(theme: SlideTheme): string {
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title>就活スライド（サンプル）</title>
<style>
  :root{
    --navy:${theme.navy};
    --navy-2:${theme.navy2};
    --blue:${theme.blue};
    --line:${theme.line};
    --ink:${theme.ink};
    --muted:${theme.muted};
    --card:${theme.card};
    --card-bd:${theme.cardBd};
    --page:${theme.page};
    --poly-a:${theme.polyA};
    --poly-b:${theme.polyB};
  }
  *{box-sizing:border-box;margin:0;padding:0;}
  body{
    background:#4a5560;
    font-family:"Hiragino Kaku Gothic ProN","Yu Gothic","YuGothic","Meiryo",sans-serif;
    color:var(--ink);
    padding:32px 16px;
    display:flex;flex-direction:column;align-items:center;gap:32px;
  }
  .wrap{width:100%;max-width:1000px;display:flex;flex-direction:column;gap:32px;}
  .cap{color:#cfd6de;font-size:13px;letter-spacing:.04em;margin:-16px 0 -8px 4px;}

  /* ===== スライド共通 ===== */
  .slide{
    position:relative;width:100%;aspect-ratio:16/9;
    background:var(--page);
    border-radius:6px;overflow:hidden;
    box-shadow:0 10px 30px rgba(0,0,0,.28);
    padding:5.2% 5.6%;
    display:flex;flex-direction:column;
  }
  .slide::after{
    content:"";position:absolute;right:-6%;top:-14%;
    width:46%;height:70%;
    background:
      linear-gradient(135deg,var(--poly-a) 0%,var(--poly-b) 60%,transparent 100%);
    clip-path:polygon(20% 0,100% 0,100% 100%,60% 80%,0 40%);
    opacity:.7;pointer-events:none;z-index:0;
  }
  .slide > *{position:relative;z-index:1;}

  .title{display:flex;align-items:center;gap:12px;padding-bottom:12px;
    border-bottom:2px solid var(--line);margin-bottom:3.4%;}
  .title .tri{color:var(--blue);font-size:20px;line-height:1;}
  .title h2{color:var(--navy);font-size:30px;font-weight:800;letter-spacing:.02em;}

  .hd{
    background:linear-gradient(180deg,var(--navy) 0%,var(--navy-2) 100%);
    color:#fff;font-weight:700;font-size:16px;text-align:center;
    padding:10px 8px;border-radius:5px 5px 0 0;letter-spacing:.03em;
  }
  .body{
    background:var(--card);border:1px solid var(--card-bd);border-top:none;
    border-radius:0 0 5px 5px;padding:16px 18px;flex:1;
    box-shadow:0 4px 10px rgba(23,61,99,.06);
  }
  ul{list-style:none;display:flex;flex-direction:column;gap:9px;}
  li{position:relative;padding-left:16px;font-size:14.5px;line-height:1.55;color:var(--ink);}
  li::before{content:"";position:absolute;left:0;top:.62em;width:6px;height:6px;
    border-radius:50%;background:var(--blue);}
  .accent{color:var(--blue);font-weight:800;}

  /* ===== ①自己紹介 ===== */
  .intro-head{display:flex;align-items:flex-end;justify-content:space-between;
    background:var(--card);border:1px solid var(--card-bd);border-radius:5px;
    padding:18px 22px;margin-bottom:3%;box-shadow:0 4px 10px rgba(23,61,99,.06);
    border-left:6px solid var(--navy);}
  .intro-head .aff{color:var(--muted);font-size:14px;margin-bottom:4px;letter-spacing:.03em;}
  .intro-head .name{color:var(--navy);font-size:34px;font-weight:800;letter-spacing:.06em;}
  .intro-head .name small{font-size:15px;color:var(--muted);font-weight:600;margin-left:10px;letter-spacing:.08em;}
  .intro-head .tag{background:var(--navy);color:#fff;font-size:12.5px;font-weight:700;
    padding:6px 14px;border-radius:20px;white-space:nowrap;}
  .cards3{display:grid;grid-template-columns:1.15fr 1fr 1fr;gap:14px;flex:1;}
  .col{display:flex;flex-direction:column;}

  /* ===== ②志望動機 / ③自己PR 共通の大見出し ===== */
  .lead{background:var(--card);border:1px solid var(--card-bd);border-radius:6px;
    border-left:6px solid var(--blue);padding:26px 28px;margin-bottom:2.8%;
    box-shadow:0 5px 14px rgba(23,61,99,.07);}
  .lead .label{color:var(--blue);font-size:13px;font-weight:700;letter-spacing:.12em;margin-bottom:10px;}
  .lead .big{color:var(--navy);font-size:32px;font-weight:800;line-height:1.4;letter-spacing:.01em;}
  .lead .big .em{color:var(--blue);}
  .sub-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;flex:1;}
  .sub{display:flex;flex-direction:column;}
  .note{background:var(--card);border:1px solid var(--card-bd);border-top:none;
    border-radius:0 0 5px 5px;padding:16px 18px;flex:1;display:flex;align-items:center;
    box-shadow:0 4px 10px rgba(23,61,99,.06);}
  .note p{font-size:16px;line-height:1.6;color:var(--ink);}
  .single{display:flex;flex-direction:column;flex:1;}

  .foot{position:absolute;left:5.6%;bottom:3.4%;display:flex;align-items:center;gap:8px;z-index:1;}
  .foot .dot{width:16px;height:16px;border-radius:50%;
    background:linear-gradient(135deg,var(--navy),var(--blue));}
  .foot span{color:var(--muted);font-size:12px;letter-spacing:.06em;}
</style>
</head>
<body>
<div class="wrap">

  <p class="cap">① 自己紹介（サンプル）</p>
  <section class="slide">
    <div class="title"><span class="tri">▶</span><h2>自己紹介</h2></div>

    <div class="intro-head">
      <div>
        <div class="aff">○○大学 ○○学部 ○○学科　4年</div>
        <div class="name">田中 太郎<small>Taro Tanaka</small></div>
      </div>
      <div class="tag">社会学 専攻</div>
    </div>

    <div class="cards3">
      <div class="col">
        <div class="hd">研究内容</div>
        <div class="body">
          <ul>
            <li>地域コミュニティにおける<span class="accent">情報格差</span>の問題をテーマに研究</li>
            <li>「技術が人にどう使われるか」という視点で調査・分析</li>
          </ul>
        </div>
      </div>
      <div class="col">
        <div class="hd">研究を通して感じたこと</div>
        <div class="body">
          <ul>
            <li>ITツールが人々の生活を大きく変える可能性を実感</li>
            <li>「使う側」から<span class="accent">「作る側」</span>へ回りたいと考えるように</li>
          </ul>
        </div>
      </div>
      <div class="col">
        <div class="hd">現在行っていること</div>
        <div class="body">
          <ul>
            <li>独学で<span class="accent">プログラミングの基礎</span>を学習中</li>
            <li>ExcelマクロやPythonで身近な作業の自動化に挑戦</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="foot"><span class="dot"></span><span>Self Introduction</span></div>
  </section>

  <p class="cap">② 志望動機（サンプル）</p>
  <section class="slide">
    <div class="title"><span class="tri">▶</span><h2>志望動機</h2></div>

    <div class="lead">
      <div class="label">POINT ─ ひとことで言うと</div>
      <div class="big">“<span class="em">人に寄り添うものづくり</span>”に、<br>強く共感したからです。</div>
    </div>

    <div class="single">
      <div class="hd">動機の補足</div>
      <div class="note">
        <p>文系で培った人間理解の視点を活かせるから。<br>
        非エンジニアの視点を強みに、使いやすいシステムづくりに貢献したいと考えています。</p>
      </div>
    </div>

    <div class="foot"><span class="dot"></span><span>Motivation</span></div>
  </section>

  <p class="cap">③ 自己PR（サンプル）</p>
  <section class="slide">
    <div class="title"><span class="tri">▶</span><h2>自己PR</h2></div>

    <div class="lead">
      <div class="label">MY STRENGTH ─ 私の強み</div>
      <div class="big">課題を分解し、<span class="em">周囲を巻き込みながら</span><br>解決に導く力</div>
    </div>

    <div class="sub-row">
      <div class="sub">
        <div class="hd">強みの根拠</div>
        <div class="note">
          <p>集計自動化で作業時間を約<span class="accent">6割削減</span>した経験。<br>
          工程を分解し優先度順に着手、チームを巻き込んで改善しました。</p>
        </div>
      </div>
      <div class="sub">
        <div class="hd">入社後の活かし方</div>
        <div class="note">
          <p>複雑な要件を構造化し開発現場で活かす。<br>
          対話で周囲を巻き込み、使いやすいシステムづくりに貢献します。</p>
        </div>
      </div>
    </div>

    <div class="foot"><span class="dot"></span><span>Self Promotion</span></div>
  </section>

</div>
</body>
</html>`;
}
