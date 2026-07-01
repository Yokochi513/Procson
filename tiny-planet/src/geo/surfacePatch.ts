import * as THREE from 'three';
import { projectOnPlane, orientToSurface } from '../utils/sphereMath';

/**
 * 惑星表面の一部エリア（パッチ）にオブジェクトを配置するためのヘルパー。
 *
 * アンカー方向を基準にした接平面のローカル座標 (x: 右, z: 前) で位置を指定すると、
 * 球面上の正しい3D座標へ変換し、その地点の法線にオブジェクトを立たせる。
 * 接地高さは惑星メッシュへのレイキャストで厳密に求める（icosphereの面の凹凸に追従）。
 */
export class SurfacePatch {
  readonly normal: THREE.Vector3;
  readonly right: THREE.Vector3;
  readonly forward: THREE.Vector3;
  readonly radius: number;

  private planet: THREE.Mesh;
  private raycaster = new THREE.Raycaster();
  private _q = new THREE.Quaternion();
  private _f = new THREE.Vector3();

  constructor(anchorDir: THREE.Vector3, radius: number, planet: THREE.Mesh) {
    this.normal = anchorDir.clone().normalize();
    // 接平面の前方を決める基準（極付近は別の参照軸を使う）
    const ref =
      Math.abs(this.normal.y) > 0.9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
    this.forward = projectOnPlane(ref.clone(), this.normal).normalize();
    this.right = new THREE.Vector3().crossVectors(this.forward, this.normal).normalize();
    this.radius = radius;
    this.planet = planet;
    this.raycaster.firstHitOnly = true;
  }

  /** ローカル (x: 右, z: 前) に対応する球面上の方向ベクトル（単位） */
  dirAt(x: number, z: number, target = new THREE.Vector3()): THREE.Vector3 {
    return target
      .copy(this.normal)
      .multiplyScalar(this.radius)
      .addScaledVector(this.right, x)
      .addScaledVector(this.forward, z)
      .normalize();
  }

  /** その地点の惑星表面（実際のメッシュ面）のワールド座標を返す */
  surfacePointAt(x: number, z: number, target = new THREE.Vector3()): THREE.Vector3 {
    const dir = this.dirAt(x, z, target);
    this.raycaster.set(dir.clone().multiplyScalar(this.radius + 6), dir.clone().multiplyScalar(-1));
    this.raycaster.far = this.radius + 12;
    const hits = this.raycaster.intersectObject(this.planet, false);
    if (hits.length > 0) return target.copy(hits[0].point);
    // 当たらなければ理論半径にフォールバック
    return target.copy(dir).multiplyScalar(this.radius);
  }

  /**
   * オブジェクトをローカル座標 (x,z) に配置する。
   * - モデルは原点を底面中心・+Y を上・+Z を前として作る前提
   * - height: 接地面からの追加オフセット（水面を沈める/物を浮かせる用）
   * - yaw: 法線まわりの回転（前方からの相対角, ラジアン）
   */
  place(obj: THREE.Object3D, x: number, z: number, height = 0, yaw = 0): THREE.Object3D {
    const dir = this.dirAt(x, z);
    const ground = this.surfacePointAt(x, z);
    obj.position.copy(ground).addScaledVector(dir, height);

    // 前方ベクトル = パッチ前方を法線まわりに yaw 回転
    this._f.copy(this.forward);
    this._q.setFromAxisAngle(this.normal, yaw);
    this._f.applyQuaternion(this._q);
    obj.quaternion.copy(orientToSurface(dir, this._f));
    return obj;
  }
}
