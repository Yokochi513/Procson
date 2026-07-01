import * as THREE from 'three';

/**
 * 惑星に散らす木のクオリティ版。
 * 単純な円錐ではなく、幹＋複数の葉の塊（重ね）で立体感を出し、
 * 樹種・色・大きさ・傾きをランダムに変えて自然な群生に見せる。
 *
 * パフォーマンスのため、ジオメトリとマテリアルは共有する（メッシュごとに複製しない）。
 */

// --- 共有ジオメトリ（なめらかに見えるよう分割を上げる。共有なのでメモリは1個分） ---
const G = {
  blob: new THREE.IcosahedronGeometry(1, 2), // 広葉樹の葉の塊（スケールして使う）
  cone: new THREE.ConeGeometry(1, 1, 12), // 針葉樹の段
  trunk: new THREE.CylinderGeometry(0.07, 0.12, 1, 10),
};

// --- 共有マテリアル（緑のバリエーション） ---
const leafGreens = [0x6f9f50, 0x7cb342, 0x5f8f44, 0x8bbf5a, 0x6aa05f].map(
  (c) => new THREE.MeshStandardMaterial({ color: c, flatShading: false, roughness: 0.85 }),
);
const pineGreens = [0x3f6f43, 0x4a7d4a, 0x355f3a].map(
  (c) => new THREE.MeshStandardMaterial({ color: c, flatShading: false, roughness: 0.85 }),
);
const trunkMats = [0x6b4f3a, 0x5b4230, 0x76583f].map(
  (c) => new THREE.MeshStandardMaterial({ color: c, flatShading: false, roughness: 0.95 }),
);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 広葉樹: 幹＋重なった葉の塊 */
function makeBroadleaf(): THREE.Group {
  const g = new THREE.Group();
  const trunkH = 0.8 + Math.random() * 0.5;
  const trunk = new THREE.Mesh(G.trunk, pick(trunkMats));
  trunk.scale.set(1, trunkH, 1);
  trunk.position.y = trunkH / 2;
  trunk.castShadow = true;
  g.add(trunk);

  // 2〜3個の葉の塊を少しずらして重ねる
  const blobs = 2 + Math.floor(Math.random() * 2);
  const baseR = 0.55 + Math.random() * 0.25;
  for (let i = 0; i < blobs; i++) {
    const leaf = new THREE.Mesh(G.blob, pick(leafGreens));
    const r = baseR * (1 - i * 0.12);
    leaf.scale.set(r, r * (0.85 + Math.random() * 0.3), r);
    leaf.position.set(
      (Math.random() - 0.5) * 0.4,
      trunkH + 0.35 + i * 0.32,
      (Math.random() - 0.5) * 0.4,
    );
    leaf.rotation.y = Math.random() * Math.PI;
    leaf.castShadow = true;
    g.add(leaf);
  }
  return g;
}

/** 針葉樹: 幹＋段重ねの円錐 */
function makePine(): THREE.Group {
  const g = new THREE.Group();
  const trunkH = 0.5 + Math.random() * 0.3;
  const trunk = new THREE.Mesh(G.trunk, pick(trunkMats));
  trunk.scale.set(0.8, trunkH, 0.8);
  trunk.position.y = trunkH / 2;
  trunk.castShadow = true;
  g.add(trunk);

  const mat = pick(pineGreens);
  const tiers = 3;
  const totalH = 1.6 + Math.random() * 0.8;
  for (let i = 0; i < tiers; i++) {
    const t = i / tiers;
    const cone = new THREE.Mesh(G.cone, mat);
    const r = (0.7 - t * 0.42) * (0.9 + Math.random() * 0.2);
    const h = totalH / tiers + 0.25;
    cone.scale.set(r, h, r);
    cone.position.y = trunkH + 0.1 + i * (totalH / tiers) * 0.78 + h / 2;
    cone.castShadow = true;
    g.add(cone);
  }
  return g;
}

/**
 * 木を1本生成する（原点=底面中心, +Y上）。
 * @param scale 全体スケール
 * @param type  'broadleaf' | 'pine' を指定すると樹種を固定（省略時はランダム）
 */
export function makeTree(scale = 1, type?: 'broadleaf' | 'pine'): THREE.Group {
  const usePine = type ? type === 'pine' : Math.random() < 0.35;
  const tree = usePine ? makePine() : makeBroadleaf();
  const s = scale * (0.85 + Math.random() * 0.5);
  tree.scale.multiplyScalar(s);
  // わずかな傾きで硬さを消す
  tree.rotation.z = (Math.random() - 0.5) * 0.12;
  tree.rotation.x = (Math.random() - 0.5) * 0.12;
  return tree;
}
