import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SurfacePatch } from './surfacePatch';

/**
 * 外部で作った glTF/glb モデルを惑星に配置するためのローダー（高精細化パイプライン）。
 *
 * 想定ワークフロー:
 *   1. Meshy / Tripo / Sketchfab などで建物を作る・入手する
 *   2. .glb で書き出して `public/models/` に置く
 *   3. placeModel() で読み込み → 自動でスケール・接地・配置
 *
 * モデルの原点や大きさがまちまちでも、バウンディングbox から
 * 「底面中心を原点・指定の高さ」に正規化するので、そのまま惑星に立つ。
 */

const loader = new GLTFLoader();

export interface ModelOptions {
  /** ワールド単位での目標の高さ。指定すると自動スケールする（例: 城=12） */
  targetHeight?: number;
  /** 法線まわりの向き（度） */
  yawDeg?: number;
  /** 影の投影/受けを有効化（既定 true） */
  shadow?: boolean;
}

/**
 * モデルを「底面中心=原点・(任意で)指定の高さ」に正規化したグループを返す。
 * patch.place() は原点=底面中心・+Y上・+Z前 を前提にしているため、これで素直に立つ。
 */
export function normalizeModel(object: THREE.Object3D, targetHeight?: number): THREE.Group {
  const group = new THREE.Group();
  group.add(object);
  object.updateWorldMatrix(true, true);

  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  // 底面中心 (x:center, y:min, z:center) を原点へ移動。
  // AABB は平行移動量だけシフトするので、現在の位置に差分を「加算」する
  // （モデルのルートノードが原点に無いケースでも正しく合わせるため）。
  object.position.add(new THREE.Vector3(-center.x, -box.min.y, -center.z));

  if (targetHeight && size.y > 1e-6) {
    group.scale.setScalar(targetHeight / size.y);
  }
  return group;
}

/**
 * glb/glTF を読み込み、惑星パッチ上のローカル座標 (x,z) に配置する。
 * 読み込みに失敗（ファイルが無い等）した場合は null で解決する（フォールバック用）。
 */
export function placeModel(
  scene: THREE.Scene,
  patch: SurfacePatch,
  url: string,
  x: number,
  z: number,
  opts: ModelOptions = {},
): Promise<THREE.Group | null> {
  return new Promise((resolve) => {
    loader.load(
      url,
      (gltf) => {
        const model = normalizeModel(gltf.scene, opts.targetHeight);
        if (opts.shadow !== false) {
          model.traverse((o) => {
            const m = o as THREE.Mesh;
            if (m.isMesh) {
              m.castShadow = true;
              m.receiveShadow = true;
            }
          });
        }
        patch.place(model, x, z, 0, THREE.MathUtils.degToRad(opts.yawDeg ?? 0));
        scene.add(model);
        resolve(model);
      },
      undefined,
      (err) => {
        console.warn(`[loadModel] 読み込み失敗（フォールバックします）: ${url}`, err);
        resolve(null);
      },
    );
  });
}
