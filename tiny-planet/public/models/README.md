# 建物モデルの入れ方（高精細化パイプライン）

外部のAI/サービスで作った3Dモデルを、ここ（`public/models/`）に置くだけで惑星に反映されます。

## 手順

1. **モデルを作る/入手する**
   - AI生成: [Meshy](https://www.meshy.ai/) / [Tripo](https://www.tripo3d.ai/) / [Luma Genie](https://lumalabs.ai/genie) / [Rodin](https://hyper3d.ai/)
     - テキスト→3D、または **写真→3D**（実物写真から起こすと再現度が上がる）
   - 無料CCモデル: [Sketchfab](https://sketchfab.com/)（ライセンス確認）/ [Poly Pizza](https://poly.pizza/) / [Quaternius](https://quaternius.com/)
2. **`.glb` 形式で書き出す**（推奨）
   - できれば **Draco/Meshopt 圧縮なし**で書き出す（このプロジェクトは現状デコーダ未設定のため）
   - 圧縮ありが必要になったら言ってください。DRACOLoader/Meshopt を組み込みます
3. **ここに決まった名前で置く**
   - 岡山城: `public/models/okayama-castle.glb`
   - （ファイルがあれば自動でそれを使い、無ければ手作りの様式化版にフォールバックします）
4. ブラウザを再読み込み → 反映を確認

## モデル側の約束ごと（守るとそのまま綺麗に立ちます）

- **正面を +Z** に向ける
- **向き**: Y-up（glbの標準）。原点・スケールは多少ズレてもOK（読み込み時に「底面中心=原点・指定の高さ」へ自動正規化します）
- **高さの目安（自動スケールの目標値）**: 岡山城は約12ワールド単位。`src/main.ts` の `targetHeight` で調整可
- **ポリゴン/テクスチャは控えめに**（このゲームは軽量・60fps目標）。テクスチャは2K以下推奨

## 別の建物も追加したいとき

`src/main.ts` で、対象パッチとローカル座標を指定して `placeModel(...)` を呼ぶだけです。
URLとの紐づけ（ポータル）は `portalManager.add({ name, position, radius, url })` を併記します。

## ライセンス

CCモデルや生成物の**帰属表示・利用条件**は各サービスの規約に従ってください。
このリポジトリに含めるモデルの出典は、ここに追記して管理すると安全です。
