import * as THREE from 'three';
import { SurfacePatch } from '../geo/surfacePatch';
import { addBuildingCollider } from '../collision';
import { makeTree } from './trees';

/** 後楽園（唯心山エリア）: 丘・沢の池・茶室・松。 */

const M = (c: number, o: THREE.MeshStandardMaterialParameters = {}): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: 0.8, metalness: 0, ...o });

/** 寄棟屋根の小さな茶室 */
function teaHouse(): THREE.Group {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.16, 1.4), M(0x8b6343));
  base.position.y = 0.08;
  g.add(base);
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.95, 1.2), M(0xf5f0e8));
  body.position.y = 0.16 + 0.475;
  body.castShadow = true;
  g.add(body);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.7, 4), M(0x6e4a30, { roughness: 0.7 }));
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 0.16 + 0.95 + 0.34;
  roof.castShadow = true;
  g.add(roof);
  addBuildingCollider(g);
  return g;
}

function placeTree(scene: THREE.Scene, patch: SurfacePatch, x: number, z: number): void {
  const anchor = new THREE.Group();
  anchor.add(makeTree(1.0, 'pine'));
  patch.place(anchor, x, z, 0);
  scene.add(anchor);
}

export function buildKorakuen(scene: THREE.Scene, patch: SurfacePatch): THREE.Vector3 {
  // 唯心山の丘（草緑）
  const hill = new THREE.Mesh(new THREE.ConeGeometry(3.0, 1.6, 18), M(0x6b9e4e));
  hill.receiveShadow = true;
  patch.place(hill, -1.6, -1.4, -0.2);
  scene.add(hill);

  // 沢の池（EllipseCurve でフラットな水面）
  const curve = new THREE.EllipseCurve(0, 0, 2.6, 1.7, 0, Math.PI * 2, false, 0);
  const pondGeo = new THREE.ShapeGeometry(new THREE.Shape(curve.getPoints(32)));
  pondGeo.rotateX(-Math.PI / 2);
  const pond = new THREE.Mesh(
    pondGeo,
    M(0x7abfcf, { transparent: true, opacity: 0.82, roughness: 0.2, metalness: 0.1 }),
  );
  patch.place(pond, 1.7, 1.2, 0.04);
  scene.add(pond);

  // 茶室
  const th = teaHouse();
  patch.place(th, 2.0, -1.9, 0, Math.PI * 0.15);
  scene.add(th);

  // 松を散在
  for (const [x, z] of [
    [-2.6, 1.8],
    [-0.4, 2.7],
    [3.0, 1.0],
    [0.8, -2.8],
  ] as [number, number][]) {
    placeTree(scene, patch, x, z);
  }

  return patch.surfacePointAt(0, 0);
}
