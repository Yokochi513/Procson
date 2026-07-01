# Tiny Planet

「小さな惑星ゲーム」設計書の実装。重力が中心に向かう球状の小さな惑星の上を、キャラクターが重力に沿って一周歩き回れるプロトタイプです。惑星の頂上付近に、岡山のランドマーク（**倉敷美観地区の運河の町並み**と**岡山城＝烏城**）を手作りで再現しています。

## 技術スタック

- TypeScript + [Vite](https://vitejs.dev/)
- [Three.js](https://threejs.org/)
- [three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh)（接地判定のレイキャスト高速化）

## セットアップ

```bash
cd tiny-planet
npm install
npm run dev      # 開発サーバー（http://localhost:5173）
npm run build    # 型チェック + 本番ビルド（dist/）
```

## 操作

- **WASD / 矢印キー**: 移動（カメラ基準・接平面に投影）
- **Space**: ジャンプ
- **マウスドラッグ**: 三人称カメラの回転（方位・仰角）

## フェーズ1で実装した要件

| ID | 内容 | 実装箇所 |
|----|------|----------|
| F1-1 | IcosahedronGeometry で球状の地面を生成（半径・分割数は定数） | `src/planet/createPlanet.ts` |
| F1-2 | `computeBoundsTree()` で BVH 構築 | `src/planet/createPlanet.ts` |
| F1-3 | 重力方向 =「惑星中心 → キャラクター」を毎フレーム計算 | `PlanetCharacterController.update` |
| F1-4 | ローカルup軸を法線へ slerp で補間 | `orientToSurface` + `quaternion.slerp` |
| F1-5 | 入力を接平面に投影してから移動方向を決定 | `projectOnPlane` |
| F1-6 | BVH レイキャストで接地判定し常に球面上に立たせる | `raycaster.intersectObject` |
| F1-7 | 三人称カメラを up の変化に追従させる | `src/controller/cameraRig.ts` |
| F1-8 | プレースホルダー（立方体・円錐）を法線方向に6個配置 | `src/main.ts` `addPlaceholders` |

**完了条件**: 球の上を一周しても上下逆転や視点の破綻が起きずに歩き回れること（達成済み）。

## フェーズ2: ランドマークの再現（APIを使わない手作り版）

設計書のフェーズ2は本来 Overpass API で現実建物を取得する想定ですが、本実装では**岡山の風景イメージを手作りで再現する方針**に変更しています（外部API・帰属表示は不要）。

| 要素 | 内容 | 実装箇所 |
|------|------|----------|
| 配置基盤 | アンカー方向の接平面ローカル座標 (x,z) → 球面3D座標へ変換し、レイキャストで接地 | `src/geo/surfacePatch.ts` |
| 倉敷美観地区 | 緑がかった運河・石護岸・しだれ柳・白壁/なまこ壁の蔵・アーチ橋・川舟・石灯籠 | `src/landmarks/bikanDistrict.ts` |
| 岡山城（烏城） | 石垣・黒い下見板張りの多層天守・黒瓦屋根・白漆喰の帯・金の鯱 | `src/landmarks/okayamaCastle.ts` |
| 環境表現 | RoomEnvironment による IBL・ACESトーンマッピング・フィルライト（やわらかいトーン） | `src/main.ts` |

美観地区は惑星の頂点付近、岡山城はそこから運河の延長線上に約40°離れた位置に配置しており、運河沿いを歩いて城まで行けます。キャラクターは美観地区の川沿いにスポーンします。

### 再現の根拠（データ元）

実物データの取得は行わず、各ランドマークの一般的な特徴（写真・映像から広く知られる要素）をもとに様式化しています。特定の構図・建物に寄せたい場合は参照写真を共有してください。

## 主要な調整パラメータ

- 惑星の大きさ・分割数: `src/planet/createPlanet.ts` の `PLANET_RADIUS` / `PLANET_DETAIL`
- 移動速度・重力・ジャンプ力: `src/controller/PlanetCharacterController.ts` 冒頭の定数
- カメラ距離・追従の滑らかさ: `src/controller/cameraRig.ts` の `distance` / `followLerp`

## 次のフェーズ

- フェーズ2: Overpass API から現実建物データを取得し、惑星上の一部エリアに 3D で再現
- フェーズ3: 道路・衛星画像・色味の作り込み

詳細は設計書を参照。建物データ利用時は OpenStreetMap の帰属表示が必要です。
