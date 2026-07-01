import * as THREE from 'three';

/**
 * 三人称カメラリグ（設計書 5.3 / F1-7）。
 * up ベクトルが動的に変わるため OrbitControls は使わず、カメラ位置・up を毎フレーム手動計算する。
 *
 * 基本はカメラが常に進行方向（facing）の真後ろに自動で回り込む（オートフォロー）。
 * 移動中は yaw が 0（=真後ろ）へ自動的に戻るため、WASD だけで「正面を見ながら」歩ける。
 * 停止中はマウスドラッグで自由に見回せる（yaw/pitch）。
 */
export class CameraRig {
  private camera: THREE.PerspectiveCamera;

  /** キャラクターの後方・上方への距離 */
  distance = 2;
  /** 注視点を足元からどれだけ上げるか */
  lookHeight = 0.8;
  /** 追従の滑らかさ（0..1、大きいほど機敏） */
  followLerp = 0.16;
  /** 移動中に yaw を真後ろ(0)へ戻す速さ（0..1） */
  recenterSpeed = 0.12;

  // マウス操作で動かす方位・仰角
  private yaw = 0; // facing からの相対回転
  private pitch = 0.35; // ラジアン（上から見下ろす量）
  private minPitch = -0.6;
  private maxPitch = 1.2;

  private dragging = false;
  private lastX = 0;
  private lastY = 0;

  private _desiredPos = new THREE.Vector3();
  private _offsetDir = new THREE.Vector3();
  private _right = new THREE.Vector3();
  private _flatForward = new THREE.Vector3();
  private _lookTarget = new THREE.Vector3();
  private _q = new THREE.Quaternion();

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.attachInput(domElement);
  }

  private attachInput(el: HTMLElement): void {
    el.addEventListener('pointerdown', (e) => {
      this.dragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointerup', (e) => {
      this.dragging = false;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* capture が無いケースは無視 */
      }
    });
    el.addEventListener('pointermove', (e) => {
      if (!this.dragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.yaw -= dx * 0.005;
      this.pitch = THREE.MathUtils.clamp(this.pitch + dy * 0.005, this.minPitch, this.maxPitch);
    });
  }

  /**
   * @param targetPos キャラクター位置
   * @param up        その地点の法線（キャラクターの上）
   * @param facing    キャラクターの前方（接平面上）
   * @param isMoving  移動中か（true の間はカメラを進行方向の真後ろへ自動で戻す）
   */
  update(targetPos: THREE.Vector3, up: THREE.Vector3, facing: THREE.Vector3, isMoving = false): void {
    // 移動中（かつドラッグしていない）ときは yaw を真後ろ(0)へ自動で戻す＝オートフォロー
    if (isMoving && !this.dragging) {
      this.yaw = THREE.MathUtils.lerp(this.yaw, 0, this.recenterSpeed);
      this.pitch = THREE.MathUtils.lerp(this.pitch, 0.35, this.recenterSpeed * 0.5);
      if (Math.abs(this.yaw) < 1e-3) this.yaw = 0;
    }

    // facing を接平面へ正規化（保険）
    this._flatForward.copy(facing).addScaledVector(up, -facing.dot(up)).normalize();
    this._right.crossVectors(this._flatForward, up).normalize();

    // yaw: up 軸まわりに後方ベクトルを回す
    const back = this._offsetDir.copy(this._flatForward).multiplyScalar(-1);
    this._q.setFromAxisAngle(up, this.yaw);
    back.applyQuaternion(this._q);

    // pitch: right 軸まわりに持ち上げる（up方向へ起こす）
    const pitchAxis = this._right.clone().applyQuaternion(this._q);
    this._q.setFromAxisAngle(pitchAxis, -this.pitch);
    back.applyQuaternion(this._q);

    // 望ましいカメラ位置 = 注視点 + back*distance（back は up成分を含む）
    this._lookTarget.copy(targetPos).addScaledVector(up, this.lookHeight);
    this._desiredPos.copy(this._lookTarget).addScaledVector(back.normalize(), this.distance);

    this.camera.position.lerp(this._desiredPos, this.followLerp);
    this.camera.up.copy(up);
    this.camera.lookAt(this._lookTarget);
  }
}
