import * as THREE from 'three';

/**
 * 桃太郎風のローポリ・プレイヤーキャラクター（手作り・glb不使用）。
 *
 * - 原点 = 足元中心、+Y上、正面は -Z（コントローラの向き合わせと一致）
 * - ミニチュア感のあるデフォルメ体型（全高 ≈ 1.3）
 * - 三角形 300 以下（実測 ≈ 256）
 * - パーツ参照は group.userData.parts に格納し、プロシージャルアニメで回す
 */

// 色
const SKIN = 0xffccaa;
const BAND = 0x5bafcf; // 鉢巻き（水色）
const KIMONO = 0xe8829a; // 着物（桃色）
const BAG = 0xd4a96a; // きびだんご袋（薄茶）
const DARK = 0x2a2438;

function mat(color: number, opts: THREE.MeshStandardMaterialParameters = {}): THREE.MeshStandardMaterial {
  // スムースシェーディングで丸みのある見た目に
  return new THREE.MeshStandardMaterial({ color, metalness: 0, roughness: 0.8, flatShading: false, ...opts });
}

export type AnimationState = 'idle' | 'walk' | 'run' | 'jump';

interface MomotaroParts {
  head: THREE.Object3D;
  body: THREE.Object3D;
  armL: THREE.Object3D;
  armR: THREE.Object3D;
  legL: THREE.Object3D;
  legR: THREE.Object3D;
  baseBodyY: number;
}

/** 関節（肩・股）を支点に振れる手足。グループ原点=支点、メッシュは下方向へ伸ばす */
function makeLimb(len: number, r: number, color: number): THREE.Group {
  const g = new THREE.Group();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.8, r, len, 10), mat(color));
  mesh.position.y = -len / 2;
  mesh.castShadow = true;
  g.add(mesh);
  return g;
}

/**
 * 桃太郎を生成する（原点=足元中心, +Y上, 正面=-Z）。
 */
export function createMomotaro(): THREE.Group {
  const g = new THREE.Group();

  const hipY = 0.38;
  const bodyH = 0.5;
  const shoulderY = hipY + bodyH - 0.05;

  // 胴体（着物）
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.32, bodyH, 16), mat(KIMONO));
  body.position.y = hipY + bodyH / 2;
  body.castShadow = true;
  g.add(body);

  // 頭（肌色）
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 18, 14), mat(SKIN));
  head.position.y = shoulderY + 0.32;
  head.castShadow = true;
  g.add(head);

  // 鉢巻き（水色の薄い輪）
  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(0.285, 0.285, 0.12, 18, 1, true),
    mat(BAND, { side: THREE.DoubleSide }),
  );
  band.position.y = head.position.y + 0.06;
  g.add(band);

  // 目（正面 -Z 側）
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), mat(DARK));
    eye.position.set(sx * 0.1, head.position.y + 0.02, -0.24);
    g.add(eye);
  }

  // 腕（着物色, 肩から下げる）
  const armL = makeLimb(0.4, 0.07, KIMONO);
  armL.position.set(-0.3, shoulderY, 0);
  g.add(armL);
  const armR = makeLimb(0.4, 0.07, KIMONO);
  armR.position.set(0.3, shoulderY, 0);
  g.add(armR);

  // 足（着物色, 股から下げる）
  const legL = makeLimb(0.38, 0.08, KIMONO);
  legL.position.set(-0.13, hipY, 0);
  g.add(legL);
  const legR = makeLimb(0.38, 0.08, KIMONO);
  legR.position.set(0.13, hipY, 0);
  g.add(legR);

  // きびだんご袋（腰の右後ろ）
  const bag = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), mat(BAG));
  bag.position.set(0.26, hipY + 0.12, 0.14);
  bag.castShadow = true;
  g.add(bag);

  const parts: MomotaroParts = { head, body, armL, armR, legL, legR, baseBodyY: body.position.y };
  g.userData.parts = parts;
  return g;
}

// --- プロシージャルアニメーション ---

const WALK_PERIOD = 0.6;
const RUN_PERIOD = 0.42;
const WALK_AMP = THREE.MathUtils.degToRad(20);
const RUN_AMP = THREE.MathUtils.degToRad(35);

/** 角度を目標へなめらかに寄せる */
function damp(current: number, target: number, lambda: number, dt: number): number {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));
}

/**
 * 毎フレーム、状態に応じてパーツを回す（sin/cos のみ・ライブラリ不要）。
 * @param group createMomotaro() のグループ
 * @param state idle/walk/run/jump
 * @param t     経過秒（位相に使用）
 * @param delta フレーム時間（なめらかな遷移に使用）
 */
export function updateAnimation(group: THREE.Group, state: AnimationState, t: number, delta: number): void {
  const p = group.userData.parts as MomotaroParts | undefined;
  if (!p) return;
  const k = 14; // 遷移のなめらかさ

  let armLT = 0;
  let armRT = 0;
  let legLT = 0;
  let legRT = 0;
  let bodyYT = p.baseBodyY;

  switch (state) {
    case 'idle': {
      bodyYT = p.baseBodyY + Math.sin(t * 2.0) * 0.005;
      break;
    }
    case 'walk': {
      const s = Math.sin((t / WALK_PERIOD) * Math.PI * 2) * WALK_AMP;
      armLT = s;
      armRT = -s;
      legLT = -s;
      legRT = s;
      break;
    }
    case 'run': {
      const s = Math.sin((t / RUN_PERIOD) * Math.PI * 2) * RUN_AMP;
      armLT = s;
      armRT = -s;
      legLT = -s;
      legRT = s;
      // 上下バウンス（周期の倍で弾む）
      bodyYT = p.baseBodyY + Math.abs(Math.sin((t / RUN_PERIOD) * Math.PI * 2)) * 0.02;
      break;
    }
    case 'jump': {
      // 両腕を上げ、足を後ろに引いた固定姿勢
      armLT = -2.5;
      armRT = -2.5;
      legLT = -0.5;
      legRT = -0.5;
      break;
    }
  }

  p.armL.rotation.x = damp(p.armL.rotation.x, armLT, k, delta);
  p.armR.rotation.x = damp(p.armR.rotation.x, armRT, k, delta);
  p.legL.rotation.x = damp(p.legL.rotation.x, legLT, k, delta);
  p.legR.rotation.x = damp(p.legR.rotation.x, legRT, k, delta);
  p.body.position.y = damp(p.body.position.y, bodyYT, k, delta);
}
