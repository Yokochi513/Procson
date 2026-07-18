# .pptx 生成とレンダリングの技術メモ

## この環境特有のハマりどころ

このリモート環境の LibreOffice は最小構成で、そのままでは .pptx を PDF/画像に変換できない。実際に遭遇した症状と対処:

1. **`pptxgenjs` が未インストール** → `npm install pptxgenjs`（作業ディレクトリで）。
2. **LibreOffice が「source file could not be loaded」で何も変換できない**
   - 原因：`libreoffice-core` のみで、**Impress モジュール（.pptx を読む本体）が未導入**。
   - 対処：`apt-get update && apt-get install -y libreoffice-impress`
3. **ヘッドレス変換に失敗（svp プラグイン欠如）**
   - `libvclplug_svplo.so` が無く、`SAL_USE_VCLPLUGIN=svp` が使えない。gen プラグインは DISPLAY を要求する。
   - 対処：`xvfb-run` で仮想ディスプレイを与えて `soffice` を動かす。
4. **`pdftoppm` が無い（PDF→画像ができない）** → `apt-get install -y poppler-utils`

`scripts/render_qa.sh` はこれらを検出して自動導入し、.pptx → PDF → `slide-*.jpg` まで一気に行う。将来の実行はまずこのスクリプトを使えば、上記を再発見せずに済む。

## QA の手順

1. `bash scripts/render_qa.sh deck.pptx` で `slide-*.jpg` を生成。
2. 各 jpg を Read して目視。特に**文字はみ出し／要素の重なり／余白の乱れ／見出し装飾の位置ズレ**を確認。
3. 構造検証：`python /root/.claude/skills/pptx/scripts/office/validate.py deck.pptx`（"All validations PASSED!" を確認）。
4. 文字内容の確認：`markitdown deck.pptx`（誤字・欠落・順序）。

初回レンダリングは崩れが出やすい。見つけたら `build_pptx.js` を直して作り直す（PDF を作り直してから画像化する）。

## pptxgenjs の要点（詳細は公式 pptx スキル参照）

- `pres.layout = "LAYOUT_WIDE"` を**スライド追加前に**設定（13.33 × 7.5 インチ）。座標が枠外だと描画されず消える。
- 色は `#` 無し・6桁固定（例 `"17456B"`）。`#` 付きや8桁（アルファ）は**ファイルを壊す**。半透明は `transparency:0-100`（塗り）/ `opacity`（影）。
- 影の `offset` は 0 以上。上向きの影は `angle:270` ＋ 正の offset。
- 箇条書きは各アイテムに `bullet:true`。リテラルの `•` は二重弾になる。段落間隔は `paraSpaceAfter`。
- テキストボックスに内部パディングがある。図形と端を揃えるときは `margin:0`。
- 1出力＝1 `new pptxgen()`。オプションオブジェクトは使い回さない（EMU に破壊的変換されるため毎回作る）。
- 日本語は `fontFace:"Meiryo"` などを指定。プレビュー(LibreOffice)は代替フォントで描くため、幅が変わりうる。最終見た目は利用者の PowerPoint 依存。
- 複数の run で文字色・サイズを変えるには `addText([{text, options}, ...])` の配列形式を使う。改行は前の run の `breakLine:true`（空の `"\n"` run を足すと余計な空行になる）。
