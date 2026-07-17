---
marp: true
paginate: true
title: Claude Skills でスライドを作る
author: チームUNO
theme: uno
style: |
  section {
    font-family: "Yu Gothic", "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif;
    font-size: 30px;
    color: #1f2933;
    background: #ffffff;
    padding: 60px 70px;
  }
  h1 {
    color: #0b3d5c;
    font-size: 46px;
    border-bottom: 4px solid #14b8a6;
    padding-bottom: 14px;
    line-height: 1.25;
  }
  h2 { color: #0b3d5c; font-size: 34px; }
  strong { color: #0f766e; }
  a { color: #0b6bb3; }
  table { font-size: 25px; }
  th { background: #0b3d5c; color: #fff; }
  code { background: #eef2f4; color: #0b3d5c; }
  section.lead {
    background: #0b3d5c;
    color: #ffffff;
    justify-content: center;
    text-align: center;
  }
  section.lead h1 { color: #ffffff; border-bottom: none; font-size: 54px; }
  section.lead strong { color: #5eead4; }
  section::after {
    color: #94a3b8;
    font-size: 18px;
  }
  .tag {
    display: inline-block; background: #14b8a6; color: #fff;
    font-size: 20px; padding: 4px 14px; border-radius: 14px; margin-bottom: 10px;
  }
  .small { font-size: 22px; color: #52606d; }
  ul { line-height: 1.5; }
---

<!-- _class: lead -->

# Claude Skills でスライドを作る

## 〜 一か月間のハッカソン成果発表 〜

発表者： ○○○○ ｜ チームUNO ｜ 2026-07-18

<!--
【要記入】発表者名を入れてください。
つかみ：今日は「一か月のハッカソンで、AI（Claude Skills）を使ってこのスライド自体をどう作ったか」を話します。
-->

---

# 発表の目的

<span class="tag">GOAL</span>

- 一か月間のハッカソンで取り組んだ **成果を共有** する
- テーマは **「Claude Skills を使ってスライドを作る」** 取り組み

<span class="small">→ “作ったモノ” だけでなく “どう作ったか” を持ち帰ってもらう。</span>

---

# 今回つくったもの

<span class="tag">OUTPUT</span>

- **タイトル：** 【要記入】例）マークダウンを渡すだけでスライドが作れる型
- **主な機能・特徴：**
  - マークダウン形式の資料を渡すと、対話しながらスライドを生成
  - デザインの希望（参考URL・イメージ）を反映できる
  - 完成前に HTML でプレビューし、確認してから仕上げる

<!--
【要確認】主な機能・特徴は文脈からの提案。実際の成果に合わせて修正してください。
-->

---

# AIの使い方 ①：ツールと場面

<span class="tag">HOW</span>

- **使用したAIツール：** Claude Skills
- **使った場面：** 【要記入】例）発表スライド（本資料）の作成

---

# AIの使い方 ②：プロンプトの工夫点

<span class="tag">HOW</span>

- 記載内容は、別途作成した **マークダウン形式の資料を添付** させる
- デザインは希望に合わせられるよう、**参考URL・デザインを送る** よう指示する
- **具体的な数値を入れる** よう指示する
- **不明点は質問させる**（勝手に判断させない）
- 完成版を出す前に **HTMLを見せてOKをもらう**

---

# 一番つまずいた・悩んだ点

<span class="tag">PROBLEM</span>

- デザインする際、**作成するたびに仕上がりが変わり**、思い通りのスライドを作れなかった
- ばらついたのは主にこの4点

| 観点 | 内容 |
|------|------|
| 文字数 | スライドごとに情報量がバラつく |
| テキストサイズ | 見出し・本文の大きさが安定しない |
| 配置 | 要素のレイアウトが毎回変わる |
| 色味 | 配色のトーンがそろわない |

---

# どう乗り越えたか

<span class="tag">SOLUTION</span>

- **AIに解決策を出させる**
  - 「〜に困っているので、解決するための策を◯つ挙げてください」
- **AIに現状を整理させる**
  - 「〜に困っていて〜したいので、現状の〜について教えてください」
- **AIの提案を土台にする**
  - 生成AIが作った手順書のプロンプト文を参考にする

---

# 気づいたこと・学んだこと

<span class="tag">LEARNING</span>

## AIに “曖昧な判断” をさせない工夫が重要

- **数値で表現** する
- 分からないことは **質問してもらう**
- PPTにする前に **HTMLを確認してOKをもらう**

---

# 次に活かせそうなこと

<span class="tag">NEXT</span>

- 「曖昧さをなくすにはどうすればいいか」を軸にプロンプトを組み立てる
- **明確な指示 → 確認 → 仕上げ** の流れを、他の作業にも応用する

---

<!-- _class: lead -->

# ご清聴ありがとうございました

## Claude Skills × 明確な指示で、**誰が作っても同じ品質のスライドへ**
