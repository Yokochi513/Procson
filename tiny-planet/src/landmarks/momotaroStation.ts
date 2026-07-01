import * as THREE from 'three';
import { SurfacePatch } from '../geo/surfacePatch';
import { addBuildingCollider } from '../collision';

/** 岡山駅前 桃太郎像エリア: 石畳広場・桃形台座＋金の人型像。スポーン地点。 */

const M = (c: number, o: THREE.MeshStandardMaterialParameters = {}): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: 0.8, metalness: 0, ...o });

/** 桃形台座＋人型シルエットの桃太郎像（金色） */
function statue(): THREE.Group {
  const g = new THREE.Group();
  const gold = M(0xc8a84b, { metalness: 0.2, roughness: 0.5 });

  // 石の台
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.5, 16), M(0x9a9a9a));
  pedestal.position.y = 0.25;
  pedestal.castShadow = true;
  g.add(pedestal);
  // 桃形（少し潰した球）
  const peach = new THREE.Mesh(new THREE.SphereGeometry(0.7, 10, 8), M(0xf2a0b0));
  peach.scale.set(1, 0.92, 1);
  peach.position.y = 0.5 + 0.6;
  peach.castShadow = true;
  g.add(peach);
  // 人型シルエット（金）
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.6, 8), gold);
  torso.position.y = 0.5 + 1.2 + 0.3;
  g.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), gold);
  head.position.y = 0.5 + 1.2 + 0.6 + 0.2;
  head.castShadow = true;
  g.add(head);

  addBuildingCollider(g);
  return g;
}

export interface StationResult {
  portal: THREE.Vector3;
  /** プレイヤーのスポーン位置（パッチのローカル座標 x,z） */
  spawnLocal: [number, number];
}

export function buildMomotaroStation(scene: THREE.Scene, patch: SurfacePatch): StationResult {
  // 石畳広場（低い円柱）
  const plaza = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 4.0, 0.12, 28), M(0x888888, { roughness: 0.95 }));
  plaza.receiveShadow = true;
  patch.place(plaza, 0, 0, -0.02);
  scene.add(plaza);

  // 桃太郎像（中央）
  const st = statue();
  patch.place(st, 0, 0, 0);
  scene.add(st);

  return { portal: patch.surfacePointAt(0, 0), spawnLocal: [0, -3.0] };
}
