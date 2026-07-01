import * as THREE from 'three';
import { SurfacePatch } from '../geo/surfacePatch';
import { createCanalWater, CanalWater } from './water';
import { addBuildingCollider } from '../collision';

/**
 * 倉敷美観地区（倉敷川沿い）の様式化再現。
 * 緑がかった運河・石護岸・しだれ柳・白壁/なまこ壁の蔵・アーチ橋・川舟・石灯籠。
 */

// やわらかいトーンの色パレット
const C = {
  water: 0x6fa6a0, // 倉敷川の穏やかな青緑
  stone: 0x9a948b,
  stoneDark: 0x6f6a62,
  wallWhite: 0xf2eee3, // 白漆喰
  namako: 0x3b3a38, // なまこ壁/腰板（黒）
  roof: 0x55585c, // 黒瓦
  wood: 0x6b4f3a,
  willowLeaf: 0x86b84e,
  willowLeafDark: 0x6f9f3f,
  boat: 0x4a3a2a,
  lantern: 0x8d8a82,
};

function mat(color: number, opts: THREE.MeshStandardMaterialParameters = {}): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.9, ...opts });
}

/** 三角断面（切妻屋根）を押し出して作る */
function gableRoof(width: number, ridgeH: number, depth: number, color: number): THREE.Mesh {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(width / 2, 0);
  shape.lineTo(0, ridgeH);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  geo.translate(0, 0, -depth / 2); // 奥行き方向に中央寄せ
  const roof = new THREE.Mesh(geo, mat(color, { roughness: 0.7 }));
  roof.castShadow = true;
  return roof;
}

/** しだれ柳（重なる葉の塊＋テーパーした垂れ枝） */
function makeWillow(scale = 1): THREE.Group {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.09 * scale, 0.16 * scale, 1.5 * scale, 6), mat(C.wood, { roughness: 0.95 }));
  trunk.position.y = 0.75 * scale;
  trunk.castShadow = true;
  g.add(trunk);

  // 重なる葉の塊で丸いボリュームを作る
  const canopyY = 1.75 * scale;
  const blobs: [number, number, number, number][] = [
    [0, 0, 0, 1.0],
    [0.4, -0.18, 0.2, 0.7],
    [-0.35, -0.1, -0.3, 0.66],
    [0.1, 0.22, -0.12, 0.6],
  ];
  for (const [ox, oy, oz, r] of blobs) {
    const blob = new THREE.Mesh(
      new THREE.IcosahedronGeometry(r * scale, 1),
      mat(Math.random() < 0.5 ? C.willowLeaf : C.willowLeafDark),
    );
    blob.scale.set(1, 0.7, 1);
    blob.position.set(ox * scale, canopyY + oy * scale, oz * scale);
    blob.castShadow = true;
    g.add(blob);
  }

  // 垂れ枝（内外2リング・先細り）
  const rings = [
    { r: 0.85, len: 1.3, n: 10 },
    { r: 0.55, len: 0.95, n: 7 },
  ];
  for (const ring of rings) {
    for (let i = 0; i < ring.n; i++) {
      const a = (i / ring.n) * Math.PI * 2 + Math.random() * 0.3;
      const len = ring.len * (0.8 + Math.random() * 0.5) * scale;
      const strand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012 * scale, 0.04 * scale, len, 4),
        mat(i % 2 ? C.willowLeafDark : C.willowLeaf),
      );
      strand.position.set(Math.cos(a) * ring.r * scale, canopyY - 0.2 * scale - len / 2, Math.sin(a) * ring.r * scale);
      strand.rotation.z = Math.cos(a) * 0.15;
      strand.rotation.x = -Math.sin(a) * 0.15;
      g.add(strand);
    }
  }
  return g;
}

/** なまこ壁テクスチャ（白い漆喰の格子）。一度だけ生成して使い回す */
let namakoSource: THREE.CanvasTexture | null = null;
function namakoTexture(repeatX: number, repeatY: number): THREE.CanvasTexture {
  if (!namakoSource) {
    const s = 128;
    const cv = document.createElement('canvas');
    cv.width = cv.height = s;
    const ctx = cv.getContext('2d')!;
    ctx.fillStyle = '#2f2e2c'; // 黒い瓦
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = '#ece6d6'; // 白い漆喰の目地
    ctx.lineWidth = s * 0.08;
    ctx.lineCap = 'round';
    const n = 4;
    const step = s / n;
    for (let i = -n; i <= n; i++) {
      ctx.beginPath();
      ctx.moveTo(i * step, 0);
      ctx.lineTo(i * step + s, s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(i * step, s);
      ctx.lineTo(i * step + s, 0);
      ctx.stroke();
    }
    namakoSource = new THREE.CanvasTexture(cv);
    namakoSource.wrapS = namakoSource.wrapT = THREE.RepeatWrapping;
    namakoSource.colorSpace = THREE.SRGBColorSpace;
  }
  const t = namakoSource.clone();
  t.needsUpdate = true;
  t.repeat.set(repeatX, repeatY);
  return t;
}

/** 白壁・なまこ壁の蔵（基礎・軒・大棟・扉・格子窓つき） */
function makeKura(w: number, d: number, h: number): THREE.Group {
  const g = new THREE.Group();

  // 石の基礎
  const foundation = new THREE.Mesh(new THREE.BoxGeometry(w + 0.14, 0.18, d + 0.14), mat(C.stone, { roughness: 0.95 }));
  foundation.position.y = 0.09;
  foundation.receiveShadow = true;
  g.add(foundation);

  // 白漆喰の本体
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(C.wallWhite, { roughness: 0.9 }));
  body.position.y = h / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  // なまこ壁（テクスチャ付き腰板）
  const skirtH = Math.min(0.85, h * 0.42);
  const skirt = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.05, skirtH, d + 0.05),
    new THREE.MeshStandardMaterial({ map: namakoTexture(Math.max(2, Math.round(w / 0.5)), 1), roughness: 0.7 }),
  );
  skirt.position.y = skirtH / 2 + 0.18;
  skirt.castShadow = true;
  g.add(skirt);

  // 切妻屋根（軒を深めに）＋大棟＋軒化粧板
  const roof = gableRoof(w + 0.6, h * 0.46, d + 0.5, C.roof);
  roof.position.y = h;
  g.add(roof);
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, d + 0.5), mat(C.namako, { roughness: 0.6 }));
  ridge.position.y = h + h * 0.46;
  g.add(ridge);
  for (const s of [-1, 1]) {
    const fascia = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, d + 0.5), mat(C.wood, { roughness: 0.9 }));
    fascia.position.set((s * (w + 0.6)) / 2, h - 0.03, 0);
    g.add(fascia);
  }

  // 妻面(+Z)の意匠: 扉と格子窓
  const front = d / 2;
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.62, 1.0, 0.06), mat(C.wood, { roughness: 0.85 }));
  door.position.set(0, 0.5 + 0.18, front + 0.02);
  g.add(door);

  for (const i of [-1, 1]) {
    const fx = i * w * 0.26;
    const wy = h * 0.6;
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.66, 0.05), mat(0x5b4636, { roughness: 0.8 }));
    frame.position.set(fx, wy, front + 0.02);
    g.add(frame);
    const pane = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.54, 0.05), mat(0x2a2a2a, { roughness: 0.5 }));
    pane.position.set(fx, wy, front + 0.03);
    g.add(pane);
    for (const k of [-1, 0, 1]) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.54, 0.02), mat(0x6b5a48));
      bar.position.set(fx + k * 0.12, wy, front + 0.06);
      g.add(bar);
    }
  }

  // 当たり判定（配置前のローカル状態で簡略ボックスコライダーを付与）
  addBuildingCollider(g);
  return g;
}

/** 石造りのアーチ橋（中橋イメージ） */
function makeBridge(span: number, walk: number): THREE.Group {
  const g = new THREE.Group();
  const seg = 9;
  const hump = 0.9;
  for (let i = 0; i < seg; i++) {
    const t = i / (seg - 1);
    const x = (t - 0.5) * span;
    const y = hump * (1 - Math.pow(2 * t - 1, 2)); // 放物線アーチ
    const deck = new THREE.Mesh(new THREE.BoxGeometry(span / seg + 0.05, 0.25, walk), mat(C.stone));
    deck.position.set(x, y + 0.15, 0);
    deck.castShadow = true;
    g.add(deck);
    // 欄干
    for (const s of [-1, 1]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(span / seg + 0.05, 0.4, 0.12), mat(C.stoneDark));
      rail.position.set(x, y + 0.45, (s * walk) / 2);
      g.add(rail);
    }
  }
  return g;
}

/** 川舟 */
function makeBoat(): THREE.Group {
  const g = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.28, 2.2), mat(C.boat, { roughness: 0.7 }));
  hull.position.y = 0.14;
  hull.castShadow = true;
  g.add(hull);
  // 座面
  for (const z of [-0.6, 0, 0.6]) {
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.18), mat(0x7a6650));
    seat.position.set(0, 0.28, z);
    g.add(seat);
  }
  return g;
}

/** 石灯籠 */
function makeLantern(): THREE.Group {
  const g = new THREE.Group();
  const parts: [number, number, number, number][] = [
    // [w, h, d, y]
    [0.4, 0.18, 0.4, 0.09],
    [0.14, 0.7, 0.14, 0.53],
    [0.4, 0.32, 0.4, 1.04],
    [0.5, 0.12, 0.5, 1.26],
  ];
  for (const [w, h, d, y] of parts) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(C.lantern));
    m.position.y = y;
    m.castShadow = true;
    g.add(m);
  }
  return g;
}

/**
 * 美観地区をパッチ上に構築する。
 * 運河は z（前方）方向に走り、両岸に町並みが並ぶ。
 * @returns 川沿いの歩き出し地点（キャラクターのスポーンに利用可）
 */
export function buildBikanDistrict(
  scene: THREE.Scene,
  patch: SurfacePatch,
): { spawnLocal: [number, number]; waterUpdate: CanalWater['update'] } {
  // パッチ上に配置してシーンへ追加するヘルパー
  const place = (obj: THREE.Object3D, x: number, z: number, h = 0, yaw = 0): void => {
    patch.place(obj, x, z, h, yaw);
    scene.add(obj);
  };

  const zStart = -8;
  const zEnd = 6;
  const canalHalf = 1.6; // 水路の半幅

  // --- 運河の水面（曲面に追従させるためタイル状に敷く。全タイルで波マテリアルを共有） ---
  const water = createCanalWater();
  for (let z = zStart; z <= zEnd; z += 1.4) {
    const tile = new THREE.Mesh(new THREE.BoxGeometry(canalHalf * 2, 0.12, 1.5), water.material);
    tile.receiveShadow = true;
    place(tile, 0, z, -0.18); // 護岸より少し低く
  }

  // --- 石護岸（両岸） ---
  for (let z = zStart; z <= zEnd; z += 1.0) {
    for (const s of [-1, 1]) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 1.05), mat(C.stoneDark));
      wall.castShadow = true;
      place(wall, s * (canalHalf + 0.15), z, 0.0);
    }
  }

  // --- しだれ柳（川沿いに交互配置） ---
  const willowZ = [-7, -5, -3, -1, 1, 3, 5];
  willowZ.forEach((z, i) => {
    const s = i % 2 === 0 ? -1 : 1;
    place(makeWillow(0.9 + Math.random() * 0.25), s * (canalHalf + 0.9), z, 0);
  });

  // --- 蔵・町家（両岸の外側に並べ、妻面を運河へ向ける） ---
  const kuraZ = [-6.5, -3.5, -0.5, 2.5, 5];
  kuraZ.forEach((z) => {
    for (const s of [-1, 1]) {
      const w = 2.0 + Math.random() * 0.8;
      const d = 2.4 + Math.random() * 1.0;
      const h = 2.2 + Math.random() * 1.0;
      // 妻面（+Z）を運河側へ向ける：左岸(-x)は +x を向く=yaw -90°、右岸は +90°
      const yaw = s < 0 ? -Math.PI / 2 : Math.PI / 2;
      place(makeKura(w, d, h), s * (canalHalf + 2.6), z, 0, yaw);
    }
  });

  // --- アーチ橋（運河を横断, z=0付近） ---
  place(makeBridge(canalHalf * 2 + 1.8, 1.0), 0, 0.2, 0);

  // --- 川舟 ---
  place(makeBoat(), 0.2, -4, -0.12);
  place(makeBoat(), -0.2, 2, -0.12);

  // --- 石灯籠 ---
  for (const [x, z] of [
    [canalHalf + 0.5, -6],
    [-(canalHalf + 0.5), -2],
    [canalHalf + 0.5, 3],
  ] as [number, number][]) {
    place(makeLantern(), x, z, 0);
  }

  return { spawnLocal: [canalHalf + 0.9, zStart - 1.5], waterUpdate: water.update };
}
