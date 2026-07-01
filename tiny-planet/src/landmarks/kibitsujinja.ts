import * as THREE from 'three';
import { SurfacePatch } from '../geo/surfacePatch';
import { addBuildingCollider } from '../collision';

/** 吉備津神社: 比翼入母屋造りの本殿・長い回廊・鳥居。 */

const M = (c: number, o: THREE.MeshStandardMaterialParameters = {}): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: 0.8, metalness: 0, ...o });

/** 比翼入母屋造り（2連の入母屋屋根シルエット）の本殿 */
function shrine(): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.3, 1.8), M(0xede6d6));
  body.position.y = 0.65;
  body.castShadow = true;
  g.add(body);
  // 2段（前後に並ぶ入母屋屋根）
  for (const zoff of [-0.5, 0.5]) {
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.7, 1.0, 4), M(0x7b2d00, { roughness: 0.7 }));
    roof.rotation.y = Math.PI / 4;
    roof.scale.z = 0.62;
    roof.position.set(0, 1.3 + 0.45, zoff * 0.85);
    roof.castShadow = true;
    g.add(roof);
  }
  addBuildingCollider(g);
  return g;
}

/** 朱色の鳥居（2本柱＋2本横桁）。通り抜けられるようコライダーは付けない */
function torii(): THREE.Group {
  const g = new THREE.Group();
  const red = M(0xd0400e, { roughness: 0.7 });
  for (const sx of [-1, 1]) {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 2.4, 8), red);
    pillar.position.set(sx * 0.95, 1.2, 0);
    pillar.castShadow = true;
    g.add(pillar);
  }
  const kasagi = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.2, 0.32), red); // 笠木
  kasagi.position.y = 2.45;
  g.add(kasagi);
  const nuki = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.16, 0.24), red); // 貫
  nuki.position.y = 2.0;
  g.add(nuki);
  return g;
}

export function buildKibitsujinja(scene: THREE.Scene, patch: SurfacePatch): THREE.Vector3 {
  // 本殿
  const sh = shrine();
  patch.place(sh, 0, 0, 0);
  scene.add(sh);

  // 長い回廊（細い柱＋梁を弧状に並べる）
  const postMat = M(0x6e4a30);
  const beamMat = M(0x7b2d00, { roughness: 0.7 });
  const n = 14;
  const radius = 5.5;
  for (let i = 0; i < n; i++) {
    const a = (i / (n - 1) - 0.5) * 1.5; // 弧
    const x = Math.sin(a) * radius;
    const z = 2.4 + (radius - Math.cos(a) * radius);
    const seg = new THREE.Group();
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.1, 0.18), postMat);
    post.position.y = 0.55;
    post.castShadow = true;
    seg.add(post);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.16, 0.22), beamMat);
    beam.position.y = 1.15;
    seg.add(beam);
    patch.place(seg, x, z, 0, -a);
    scene.add(seg);
  }

  // 鳥居（回廊の手前）
  const t = torii();
  patch.place(t, 0, -3.4, 0);
  scene.add(t);

  return patch.surfacePointAt(0, 0);
}
