import * as THREE from 'three';
import { SurfacePatch } from '../geo/surfacePatch';
import { addBuildingCollider } from '../collision';

/** 吉備路の田園風景: 水田の格子・五重塔（備中国分寺）。 */

const M = (c: number, o: THREE.MeshStandardMaterialParameters = {}): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: 0.8, metalness: 0, ...o });

/** 五重塔（5段の屋根が縮小しながら積み上がる） */
function pagoda(): THREE.Group {
  const g = new THREE.Group();
  const wall = M(0xeee8d0);
  const roof = M(0x3d3d3d, { roughness: 0.7 });
  let y = 0;
  let w = 1.5;
  for (let i = 0; i < 5; i++) {
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, 0.55, w), wall);
    body.position.y = y + 0.275;
    body.castShadow = true;
    g.add(body);
    const r = new THREE.Mesh(new THREE.ConeGeometry(w * 0.88, 0.5, 4), roof);
    r.rotation.y = Math.PI / 4;
    r.position.y = y + 0.55 + 0.25;
    r.castShadow = true;
    g.add(r);
    y += 0.55 + 0.34;
    w *= 0.82;
  }
  // 相輪（金）
  const sorin = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.07, 0.7, 6), M(0xc8a84b, { metalness: 0.2, roughness: 0.5 }));
  sorin.position.y = y + 0.2;
  g.add(sorin);

  addBuildingCollider(g);
  return g;
}

export function buildKibiPlain(scene: THREE.Scene, patch: SurfacePatch): THREE.Vector3 {
  // 水田タイル（格子, ジオメトリ共有）
  const paddyMat = M(0x8fc06d, { roughness: 0.95 });
  const tile = new THREE.PlaneGeometry(1.4, 1.4);
  tile.rotateX(-Math.PI / 2);
  for (let i = -2; i < 2; i++) {
    for (let j = -2; j < 2; j++) {
      const m = new THREE.Mesh(tile, paddyMat);
      m.receiveShadow = true;
      patch.place(m, i * 1.55 + 0.8, j * 1.55 + 0.8, 0.02);
      scene.add(m);
    }
  }

  // 五重塔
  const p = pagoda();
  patch.place(p, -3.4, -3.4, 0);
  scene.add(p);

  return patch.surfacePointAt(0, 0);
}
