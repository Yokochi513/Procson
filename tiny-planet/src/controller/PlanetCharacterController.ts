import * as THREE from 'three';
import { getUp, projectOnPlane, orientToSurface } from '../utils/sphereMath';
import { resolveCollisions } from '../collision';

export interface InputState {
  forward: number; // -1..1 (W/S・↑↓)
  right: number; // -1..1 (D/A・→←)
  jump: boolean;
  run?: boolean; // Shift で走る
}

const MOVE_SPEED = 7; // ワールド単位/秒（歩き）
const RUN_SPEED = 12; // ワールド単位/秒（走り）
const GRAVITY = 22; // ワールド単位/秒^2
const JUMP_SPEED = 9;
const TURN_SLERP = 0.18; // 姿勢補間の速さ（F1-4）
const RAY_START_OFFSET = 6; // レイの開始を頭上どれだけ上げるか

/**
 * 球面重力に対応したキャラクターコントローラー（設計書 5.2）。
 * - 重力方向は毎フレーム「惑星中心 → キャラクター」の逆向きで計算（F1-3）
 * - ローカルup軸を法線へ slerp で補間（F1-4）
 * - 入力は接平面へ投影してから移動方向に変換（F1-5）
 * - BVH レイキャストで接地判定し、常に球面上に立たせる（F1-6）
 */
export class PlanetCharacterController {
  readonly object: THREE.Object3D;
  private planet: THREE.Mesh;

  /** 足元（接地点）からキャラクター原点までのオフセット */
  private feetOffset: number;

  position = new THREE.Vector3();
  up = new THREE.Vector3(0, 1, 0);
  /** 接平面上の向き（前方）。移動時に更新する。 */
  facing = new THREE.Vector3(0, 0, -1);

  private verticalVelocity = 0;
  private heightAboveGround = 0;
  isGrounded = false;
  /** このフレームで水平移動入力があったか（カメラのオートフォロー判定に使う） */
  isMoving = false;

  private raycaster = new THREE.Raycaster();

  // 使い回し用の一時ベクトル（GC削減）
  private _camForward = new THREE.Vector3();
  private _camRight = new THREE.Vector3();
  private _move = new THREE.Vector3();
  private _rayOrigin = new THREE.Vector3();
  private _rayDir = new THREE.Vector3();
  private _targetQuat = new THREE.Quaternion();
  private _collBefore = new THREE.Vector3();
  private _collDelta = new THREE.Vector3();

  constructor(object: THREE.Object3D, planet: THREE.Mesh, feetOffset: number, startPosition: THREE.Vector3) {
    this.object = object;
    this.planet = planet;
    this.feetOffset = feetOffset;
    this.position.copy(startPosition);
    getUp(this.position, this.up);
    this.heightAboveGround = feetOffset;
    // BVH レイキャスト用に最短ヒットだけ取れば十分。
    this.raycaster.firstHitOnly = true;
  }

  update(dt: number, input: InputState, camera: THREE.Camera): void {
    // --- F1-3: 重力（上）方向 ---
    getUp(this.position, this.up);

    // --- F1-5: カメラ基準の入力を接平面へ投影 ---
    camera.getWorldDirection(this._camForward);
    projectOnPlane(this._camForward, this.up, this._camForward);
    if (this._camForward.lengthSq() < 1e-6) {
      // カメラが真上/真下を向く特異点の保険
      this._camForward.copy(this.facing);
      projectOnPlane(this._camForward, this.up, this._camForward);
    }
    this._camForward.normalize();
    // right = forward × up（右手系で +右 になる向き）
    this._camRight.crossVectors(this._camForward, this.up).normalize();

    this._move.set(0, 0, 0);
    this._move.addScaledVector(this._camForward, input.forward);
    this._move.addScaledVector(this._camRight, input.right);

    const moving = this._move.lengthSq() > 1e-6;
    this.isMoving = moving;
    if (moving) {
      this._move.normalize();
      const speed = input.run ? RUN_SPEED : MOVE_SPEED;
      this.position.addScaledVector(this._move, speed * dt);
      this.facing.copy(this._move);
    }

    // 接平面を移動すると球からわずかに浮く/沈むので up を取り直す。
    getUp(this.position, this.up);

    // --- F1-6: 接地判定（頭上から中心方向へレイを撃つ） ---
    this._rayOrigin.copy(this.position).addScaledVector(this.up, RAY_START_OFFSET);
    this._rayDir.copy(this.up).multiplyScalar(-1);
    this.raycaster.set(this._rayOrigin, this._rayDir);
    this.raycaster.near = 0;
    this.raycaster.far = RAY_START_OFFSET * 2 + 50;

    const hits = this.raycaster.intersectObject(this.planet, false);
    if (hits.length > 0) {
      const groundPoint = hits[0].point;

      // 重力・ジャンプ（法線方向の1次元運動）
      if (input.jump && this.isGrounded) {
        this.verticalVelocity = JUMP_SPEED;
        this.isGrounded = false;
      }
      this.verticalVelocity -= GRAVITY * dt;
      this.heightAboveGround += this.verticalVelocity * dt;

      if (this.heightAboveGround <= this.feetOffset) {
        this.heightAboveGround = this.feetOffset;
        this.verticalVelocity = 0;
        this.isGrounded = true;
      } else {
        this.isGrounded = false;
      }

      // 接地点 + 法線 × 高さ にキャラクターを置く。
      this.position.copy(groundPoint).addScaledVector(this.up, this.heightAboveGround);

      // --- 建物との衝突解決（押し返し）。球面重力・接平面移動は壊さない ---
      this._collBefore.copy(this.position);
      const resolved = resolveCollisions(this.position, this.up);
      this.position.copy(resolved);

      // 押し返しの up 成分 > 0 なら屋根の上面に乗ったとみなし接地扱い（落下を止める）
      const pushUp = this._collDelta.copy(this.position).sub(this._collBefore).dot(this.up);
      if (pushUp > 0.02) {
        if (this.verticalVelocity < 0) this.verticalVelocity = 0;
        this.isGrounded = true;
      }
      // 内部の「接地点からの高さ」を補正後の位置に合わせ、次フレームの再構築を整合させる
      this.heightAboveGround = this._collDelta.copy(this.position).sub(groundPoint).dot(this.up);
    }

    // --- F1-4: 姿勢（クォータニオン）を法線へ slerp 補間 ---
    orientToSurface(this.up, this.facing, this._targetQuat);
    this.object.quaternion.slerp(this._targetQuat, TURN_SLERP);
    this.object.position.copy(this.position);
  }
}
