import * as THREE from 'three';
import { addBuildingCollider } from '../collision';

/**
 * 岡山城（烏城）の様式化再現。
 * 黒い下見板張りの多層天守・反りのある黒瓦屋根・金の鯱・石垣。
 */

const C = {
  stone: 0x837e74, // 石垣
  stoneDark: 0x615d54,
  wall: 0x1e1d22, // 黒い下見板張り（烏=黒）
  trim: 0xece4d2, // 白漆喰の帯・窓枠
  roof: 0x3b3f44, // 黒瓦
  gold: 0xe8b830, // 金の装飾・鯱
};

/** 金（しゃちほこ・装飾）用のマテリアル。中性環境でも金色に読めるよう低メタル＋自発光気味に。 */
function goldMat(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: C.gold,
    metalness: 0.3,
    roughness: 0.4,
    emissive: 0x6b4d08,
    emissiveIntensity: 0.5,
    flatShading: true,
  });
}

function mat(color: number, opts: THREE.MeshStandardMaterialParameters = {}): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, ...opts });
}

/** 4角錐の屋根（45°回して正方形の向きを合わせる） */
function pyramidRoof(radius: number, height: number, color: number): THREE.Mesh {
  const geo = new THREE.ConeGeometry(radius, height, 4);
  const roof = new THREE.Mesh(geo, mat(color, { roughness: 0.6 }));
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  return roof;
}

/** 金の鯱（しゃちほこ）：様式化した小さな金の飾り */
function makeShachihoko(): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 6), goldMat());
  body.position.y = 0.22;
  g.add(body);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 4), goldMat());
  tail.position.set(0, 0.42, 0);
  tail.rotation.z = Math.PI * 0.15;
  g.add(tail);
  return g;
}

/**
 * 岡山城の天守を構築して返す（原点=底面中心, +Y上）。
 */
export function makeOkayamaCastle(): THREE.Group {
  const castle = new THREE.Group();

  // --- 石垣（先細りの四角錐台） ---
  const baseH = 2.6;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 3.4, baseH, 4), mat(C.stone));
  base.rotation.y = Math.PI / 4;
  base.position.y = baseH / 2;
  base.castShadow = true;
  base.receiveShadow = true;
  castle.add(base);

  // --- 天守の各層 ---
  // [幅, 高さ]
  const tiers: [number, number][] = [
    [4.2, 1.9],
    [3.4, 1.6],
    [2.7, 1.4],
    [2.0, 1.3],
  ];

  let curY = baseH;
  let lastRoofRadius = 0;
  let lastTierTop = curY;

  tiers.forEach(([w, h], i) => {
    // 黒壁
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), mat(C.wall, { roughness: 0.7 }));
    wall.position.y = curY + h / 2;
    wall.castShadow = true;
    castle.add(wall);

    // 白い帯・窓
    const band = new THREE.Mesh(new THREE.BoxGeometry(w + 0.03, 0.18, w + 0.03), mat(C.trim, { roughness: 0.6 }));
    band.position.y = curY + h * 0.78;
    castle.add(band);
    for (let f = 0; f < 4; f++) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(w * 0.5, 0.35, 0.05), mat(C.trim, { roughness: 0.5 }));
      const ang = (f * Math.PI) / 2;
      win.position.set(Math.sin(ang) * (w / 2 + 0.02), curY + h * 0.45, Math.cos(ang) * (w / 2 + 0.02));
      win.rotation.y = ang;
      castle.add(win);
    }

    // 屋根
    const roofR = w * 0.82;
    const roofH = h * 0.55;
    const roof = pyramidRoof(roofR, roofH, C.roof);
    roof.position.y = curY + h + roofH / 2;
    castle.add(roof);

    // 金の軒飾り（最上層以外）
    if (i < tiers.length - 1) {
      const eave = new THREE.Mesh(new THREE.BoxGeometry(w + 0.06, 0.06, w + 0.06), goldMat());
      eave.position.y = curY + h;
      castle.add(eave);
    }

    lastRoofRadius = roofR;
    lastTierTop = curY + h;
    curY = curY + h + roofH * 0.5;
  });

  // --- 最上層の金の鯱（屋根の両端） ---
  const ridgeY = lastTierTop + lastRoofRadius * 0.55 + 0.45;
  for (const s of [-1, 1]) {
    const shachi = makeShachihoko();
    shachi.position.set(s * (lastRoofRadius * 0.45), ridgeY, 0);
    shachi.rotation.z = s * 0.25;
    castle.add(shachi);
  }
  // 金の大棟
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(lastRoofRadius * 0.95, 0.1, 0.14), goldMat());
  ridge.position.y = ridgeY;
  castle.add(ridge);

  // 当たり判定（配置前のローカル状態で簡略ボックスコライダーを付与）
  addBuildingCollider(castle);
  return castle;
}
