import * as THREE from 'three';
import { SurfacePatch } from '../geo/surfacePatch';

/** 白桃畑: ピンクの丸い樹冠＋白桃の実を付けた木を1エリアにまとめて配置。 */

const M = (c: number, o: THREE.MeshStandardMaterialParameters = {}): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({ color: c, flatShading: false, roughness: 0.8, metalness: 0, ...o });

// ジオメトリ・マテリアルは共有（メモリ節約）。なめらかに見えるよう分割を上げる。
const FOLIAGE = new THREE.SphereGeometry(0.6, 16, 12);
const FRUIT = new THREE.SphereGeometry(0.07, 8, 6);
const TRUNK = new THREE.CylinderGeometry(0.07, 0.1, 0.7, 10);
const leafMat = M(0xf5a0b0); // 桃色の樹冠
const trunkMat = M(0x6b4f3a, { roughness: 0.95 });
const fruitMat = M(0xf7c9d0, { roughness: 0.6 }); // 薄ピンクの白桃

/** trees.ts と同スタイルの桃の木（樹冠＋実） */
function peachTree(): THREE.Group {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(TRUNK, trunkMat);
  trunk.position.y = 0.35;
  trunk.castShadow = true;
  g.add(trunk);
  const canopy = new THREE.Mesh(FOLIAGE, leafMat);
  canopy.position.y = 0.95;
  canopy.scale.set(1, 0.9, 1);
  canopy.castShadow = true;
  g.add(canopy);
  // 白桃の実を数個
  const k = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < k; i++) {
    const a = Math.random() * Math.PI * 2;
    const f = new THREE.Mesh(FRUIT, fruitMat);
    f.position.set(Math.cos(a) * 0.5, 0.85 + Math.random() * 0.2, Math.sin(a) * 0.5);
    g.add(f);
  }
  return g;
}

export function buildPeachOrchard(scene: THREE.Scene, patch: SurfacePatch): THREE.Vector3 {
  let count = 0;
  for (let i = -2; i <= 2 && count < 24; i++) {
    for (let j = -2; j <= 2 && count < 24; j++) {
      const x = i * 1.5 + (Math.random() - 0.5) * 0.5;
      const z = j * 1.5 + (Math.random() - 0.5) * 0.5;
      const anchor = new THREE.Group();
      const t = peachTree();
      t.scale.setScalar(0.85 + Math.random() * 0.4);
      anchor.add(t);
      patch.place(anchor, x, z, 0);
      scene.add(anchor);
      count++;
    }
  }
  return patch.surfacePointAt(0, 0);
}
