# 実装ハンドオフ資料（Fable 5 用）

このファイルは、tiny-planet プロジェクトを**別セッション（Fable 5）で実装してもらう**ための入口資料です。
Fable 5 はこれまでの会話文脈を持たないので、**本書＋設計書4部を読めば着手できる**ようまとめています。

---

## 0. まず読む順番
1. 本書（現状・規約・実装順序・検証方法）
2. [01_基本設計書](01_基本設計書.md) … コンセプト／要件／スコープ
3. [02_論理設計書](02_論理設計書.md) … アーキテクチャ／データモデル／§11 惑星マップ
4. [03_詳細設計書](03_詳細設計書.md) … 型定義／glb規約／各モジュールIF／定数／受け入れ条件
5. [04_ゲームプレイ設計_桃太郎ストーリー](04_ゲームプレイ設計_桃太郎ストーリー.md) … 仲間・クイズ・鬼・ボス戦

---

## 1. 一言サマリ
- **何**: 重力が中心に向かう「手のひらサイズの惑星」を、かわいいキャラで歩き回る Web 体験（参照: Messenger / messenger.abeto.co）
- **v2 の狙い**: Meshy AI 製の **glb をマニフェスト（データ）に並べるだけで世界が組み上がる**構造へ作り直す
- **重要**: **エンジン基盤は完成済み。壊さず流用する**。作るのは「データ駆動の構築層」と「桃太郎ストーリー層」

---

## 2. 技術スタック / 環境
- TypeScript + Vite / Three.js / three-mesh-bvh
- **追加 npm パッケージ禁止**（three / three-mesh-bvh / vite のみ）
- 開発: `cd tiny-planet && npm install && npm run dev`（http://localhost:5173）
- ビルド: `npm run build`（`tsc` 型チェック込み）

---

## 3. 現状のコードベース地図（v1・完成済み＝流用対象）
**これらは動作検証済み。再実装せず、そのまま使う。**

| ファイル | 役割 | 主要 API |
|---|---|---|
| `src/planet/createPlanet.ts` | 惑星（icosphere＋BVH・スムース） | `createPlanet(radius,detail)`／`PLANET_RADIUS=15`,`PLANET_DETAIL=12` |
| `src/geo/surfacePatch.ts` | 接平面ローカル→球面配置・接地 | `new SurfacePatch(anchorDir,radius,planet)`／`dirAt(x,z)`,`surfacePointAt(x,z)`,`place(obj,x,z,h,yaw)`,`forward/right/normal` |
| `src/geo/loadModel.ts` | glb 読み込み・正規化・配置 | `normalizeModel(obj,targetHeight)`,`placeModel(scene,patch,url,x,z,opts):Promise<Group\|null>` |
| `src/controller/PlanetCharacterController.ts` | 球面重力・移動・接地・当たり解決呼出 | `new PlanetCharacterController(object,planet,feetOffset,startPos)`／`update(dt,input,camera)`／`position/up/facing/isGrounded/isMoving`／`InputState{forward,right,jump,run?}`／`MOVE_SPEED=7,RUN_SPEED=12,GRAVITY=22,JUMP_SPEED=9` |
| `src/controller/cameraRig.ts` | 進行方向オートフォロー三人称 | `new CameraRig(camera,dom)`／`update(pos,up,facing,isMoving)`／`distance`（現状2→**4推奨**）,`lookHeight,followLerp,recenterSpeed` |
| `src/collision.ts` | 建物コライダー・カプセル押し返し・屋根着地 | `registerObstacle(mesh)`,`addBuildingCollider(group)`,`resolveCollisions(pos,up)`／`PLAYER_RADIUS=0.15,PLAYER_HEIGHT=0.5` |
| `src/interaction/portals.ts` | 近接案内・URL遷移 | `PortalManager.add({name,position,radius,url})`,`update(pos)`,`enter()` |
| `src/fx/postprocess.ts` | ティルトシフト＋Bloom＋出力 | `createPostFX(renderer,scene,camera):{render,setSize}` |
| `src/momotaroCharacter.ts` | 手作りキャラ＋プロシージャルアニメ（フォールバック） | `createMomotaro():Group`（足元=原点,正面-Z）,`updateAnimation(group,state,t,dt)`,`AnimationState` |
| `src/landmarks/trees.ts` | 散在物（木） | `makeTree(scale,type?)` |
| `src/landmarks/*.ts` | v1 の手作り岡山エリア（美観地区/城/後楽園/吉備津/駅前/吉備路/白桃畑） | **v2 でマニフェスト化 or テーマパックとして温存** |
| `src/main.ts` | 起動＋ゲームループ（配線） | **v2 で `buildWorld` へ委譲してスリム化** |
| `public/models/cubone.glb` | 現在のプレイヤー見た目（glb 差し込み済み） | 差し替え可 |

> DEV 時、`window.__planet` にコア状態（controller/camera/scene/renderer/THREE 等）を公開している。数値検証に使う。

---

## 4. 座標系・規約（必ず守る）
- 惑星中心 = 原点。地表 = 半径 R の球面。**up = `normalize(pos)`**、重力はその逆
- **モデルは「足元=原点・+Y上・正面 -Z」**で扱う。glb はローダが「底面中心・`targetHeight`」へ自動正規化
- 正面が逆なら `yawDeg:180`（プレイヤー現物 cubone は `rotation.y=Math.PI` で対応）
- プレイヤーの `feetOffset=0.65`（原点→足）。`charGroup` にモデルを `-feetOffset` で内包
- **glb 規約**: `.glb`（Draco/Meshopt なし）、`public/models/` に `kebab-case.glb`、三角形は建物≤5k/キャラ≤5k/小物≤1k

---

## 5. v2 で新規に作るもの（設計書に型・IFあり）
| モジュール | 参照 | 概要 |
|---|---|---|
| `src/world/manifest.ts` | 03 §2 | `WorldDef/LandmarkDef/PlacedModel/…` の型定義 |
| `src/world/world.ts` | 03 §6 | 既定の世界データ（WorldDef インスタンス） |
| `src/world/buildWorld.ts` | 03 §4.1 | マニフェスト→惑星/環境/エリア/プレイヤー構築（非同期） |
| `src/player/player.ts` | 03 §4.2 | glb プレイヤー＋AnimationMixer＋桃太郎フォールバック |
| `src/fx/environment.ts` | 03 §4.4 | 空グラデ・太陽・フォグ・**大気シェル** |
| `src/story/*`, `src/ui/overlays.ts` | 04 §9 | 仲間・クイズ・鬼・ボス戦・DOM UI |

**設計の核**: `world/world.ts` の `WorldDef` に glb を1行足す＝惑星に出現。コード変更不要（03 §6 の記述例参照）。

---

## 6. 実装順序（このとおりに刻む）
**基盤（M）→ ストーリー（SG）の順。各段階で必ず §8 の検証を通す。**
1. **M0** 型＋空マニフェスト＋`buildWorld` 骨組み（惑星＋空が出る）
2. **M1** プレイヤー glb 化（接地・移動・向き・アニメ or ボブ・スポーン）
3. **M2** 1 エリアを glb で構築（配置・当たり判定・ポータル）＝縦の体験を通す
4. **M3** マニフェストでエリアを複数に分散（惑星マップは 02 §11）
5. **M4** アート仕上げ（大気シェル・ゴールデンアワー・ポスプロ調整）
6. **M5** 最適化（InstancedMesh・サイズ・60fps）
7. **SG-0〜5** 桃太郎ストーリー（04 §12：状態マシン→仲間/クイズ→追随→鬼→ボス）

> v1 の手作りエリアは、まず 1 つを WorldDef に写経して `buildWorld` を通し、動いたら次、の順で置換する。

---

## 7. 会話中に確定した決定・前提（Fable 5 はこれを踏襲）
- 世界観は **Messenger 寄り**（やわらかいパステル・ミニチュア・のんびり）
- 岡山テーマは**任意のテーマパック扱い**（既定は温存。差し替え可能に設計）
- **カメラ距離は 2→4** に見直し（2 は近すぎ）
- 桃太郎ストーリー（04）の確定事項:
  - ボス戦 = **自動カットシーン**（仲間が自動で鬼を倒す→エンディング）
  - 鬼 = **特定エリア（鬼ヶ島）で追跡**。接触で 仲間<3=ゲームオーバー／==3=ボス戦
  - ゲームオーバー = **スポーン再開・仲間とクイズ進行は保持**
  - **未確定**: 鬼ヶ島の場所（既存「城エリア」転用 or 南極に新設）→ マニフェストで指定
- 既知の弱点: 当たり判定は高速時の深いめり込みで抜けうる（通常速度では非発生。必要なら分割 resolve）

---

## 8. 検証方法（毎変更で実施・必須）
- `npx tsc --noEmit` 通過（strict / noUnusedLocals）
- `npx vite build` 成功
- ブラウザの**コンソール error 0 件**（glb ロード失敗の warn は許容＝フォールバック）
- **見た目はスクショで直接確認しづらい**（常時 rAF 描画＋プレビュー幅の制約）。ロジックは**数値検証**する:
  - 例）接地: `player.position.length() ≈ R + feetOffset`／`isGrounded===true`
  - 例）当たり: 壁の外側から接触→押し返し量>0、屋根の上→up方向へ押上げ
  - 例）追随: 各仲間がリーダーから `followDistance±α`／接地
  - 手段: DEV の `window.__planet` に対象を公開し、preview 上で eval して数値確認
- サイズ: `gzip -c dist/assets/*.js | wc -c`、`public/models/` 合計を管理（初期 6MB 以下目標）

---

## 9. パフォーマンス予算
- 60fps（一般的なノート PC）／ドローコール ~1000 目安／初期ロード 6MB 以下
- 同一 glb の多数配置は **load をキャッシュして clone**（03 §3.5）、木・小物は **InstancedMesh**（03 §3.6）

---

## 10. アセット（Meshy AI）
- 用途: プレイヤー／建物／小物／**犬・サル・キジ・鬼**
- `.glb`（圧縮なし）で書き出し → `public/models/` → マニフェストに `url/x/z/targetHeight/collider` を記述
- 出典・ライセンスは `public/models/CREDITS.md` に追記（要作成）
- 投入チェックリストは 03 §8

---

## 11. Fable 5 へ渡す初期プロンプト（コピペ用）
> tiny-planet プロジェクト（TypeScript + Vite + Three.js + three-mesh-bvh）を v2 として実装したい。
> `tiny-planet/docs/00_実装ハンドオフ_Fable5.md` を入口に、01〜04 の設計書に従って進めてほしい。
>
> 【厳守】
> - 既存エンジン基盤（planet/surfacePatch/controller/cameraRig/collision/loadModel/portals/postprocess/momotaroCharacter）は**流用し壊さない**
> - 追加 npm パッケージ禁止。TypeScript strict を通す。`npm run build` を通す。コンソール error 0
> - 見た目はスクショで確認しづらいので、`window.__planet` 経由の**数値検証**で接地・当たり・追随を確認する
>
> 【まず M0→M2 を実装】
> 1. `src/world/manifest.ts`（03 §2 の型）と `src/world/world.ts`（最小 WorldDef）
> 2. `src/world/buildWorld.ts`（惑星＋環境＋1エリア＋プレイヤー構築、非同期）
> 3. `src/main.ts` を buildWorld へ委譲してスリム化。ゲームループは維持
> 4. プレイヤー glb 化（`src/player/player.ts`、桃太郎フォールバック）
> 5. 1 エリアを glb で配置＋当たり判定＋ポータルまで通す
>
> 各ステップで tsc / build / コンソール / 数値検証を実施し、結果を報告して。UI/ストーリー（04）は M2 が通ってから。

---

## 12. 添付すべきもの（Fable 5 に渡す資料一式）
- 本書：`docs/00_実装ハンドオフ_Fable5.md`
- 設計書：`docs/01_基本設計書.md` / `docs/02_論理設計書.md` / `docs/03_詳細設計書.md` / `docs/04_ゲームプレイ設計_桃太郎ストーリー.md`
- （可能なら）リポジトリ全体（既存 `src/` を読ませると流用が正確になる）
- Meshy で用意した glb 群（`public/models/`）と、各モデルの用途・想定実寸・紐づけURL
