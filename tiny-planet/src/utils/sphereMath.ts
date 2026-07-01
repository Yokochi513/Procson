import * as THREE from 'three';

/**
 * 球面まわりの共通計算ヘルパー。
 * 惑星中心は原点 (0,0,0) を前提とする。
 */

/** 惑星中心 → 位置 の正規化ベクトル（その地点の「上」方向 / 法線） */
export function getUp(position: THREE.Vector3, target = new THREE.Vector3()): THREE.Vector3 {
  return target.copy(position).normalize();
}

/** ベクトル v を、法線 normal の接平面へ投影する（normal成分を除去） */
export function projectOnPlane(
  v: THREE.Vector3,
  normal: THREE.Vector3,
  target = new THREE.Vector3(),
): THREE.Vector3 {
  const d = v.dot(normal);
  return target.copy(v).addScaledVector(normal, -d);
}

/**
 * フィボナッチ球面分布で count 個の単位ベクトルを返す。
 * 球面上にほぼ均等な点を配置したいとき（プレースホルダー配置など）に使う。
 */
export function fibonacciSphere(count: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2; // 1 → -1
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    points.push(new THREE.Vector3(x, y, z));
  }
  return points;
}

/**
 * 法線 up を +Y に合わせる回転を、forward をなるべく維持しつつ作る。
 * オブジェクトを球面に「立たせる」ときの基準姿勢を返す。
 */
export function orientToSurface(
  up: THREE.Vector3,
  forward: THREE.Vector3,
  target = new THREE.Quaternion(),
): THREE.Quaternion {
  const n = up.clone().normalize();
  // forward を接平面に投影
  const f = projectOnPlane(forward.clone(), n);
  if (f.lengthSq() < 1e-8) {
    // forward が法線とほぼ平行な場合の保険
    f.set(0, 0, 1);
    projectOnPlane(f, n);
    if (f.lengthSq() < 1e-8) f.set(1, 0, 0);
  }
  f.normalize();
  const right = new THREE.Vector3().crossVectors(f, n).normalize();
  const m = new THREE.Matrix4().makeBasis(right, n, f.clone().negate());
  return target.setFromRotationMatrix(m);
}
