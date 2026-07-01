import * as THREE from 'three';
import { MeshBVH, type ExtendedTriangle } from 'three-mesh-bvh';

/**
 * 建物の当たり判定。
 *
 * 方針:
 * - 建物ごとに「コライダー専用の低ポリ簡略メッシュ（箱）」を登録する。
 *   見た目の細かいメッシュ群ではなく箱1個でBVH化するので、描画にもgzipにも影響が小さい。
 * - プレイヤーをカプセルとみなし、登録した建物BVHとの貫通を押し返す。
 * - 押し返しが「上向き」のときは屋根の上面に乗ったとみなし、接地として扱う
 *   （判定は呼び出し側 PlanetCharacterController が押し返しベクトルの up 成分で行う）。
 *
 * 球面重力・接平面移動の仕組みには手を入れない（ここは純粋に位置補正のみ）。
 */

// プレイヤーのコライダーカプセル（指定どおり）。見た目の体に合わせたい場合はここを大きくする。
const PLAYER_RADIUS = 0.15;
const PLAYER_HEIGHT = 0.5;

interface Obstacle {
  mesh: THREE.Mesh;
  bvh: MeshBVH;
}

const obstacles: Obstacle[] = [];

// コライダーは描画しない（不可視）。共有マテリアルで十分。
const colliderMaterial = new THREE.MeshBasicMaterial({ visible: false });

/**
 * 建物メッシュ（コライダー）を BVH 障害物として登録する。
 * 既に boundsTree があればそれを使い、無ければ生成する。
 */
export function registerObstacle(mesh: THREE.Mesh): void {
  const geom = mesh.geometry;
  const bvh = geom.boundsTree ?? new MeshBVH(geom);
  geom.boundsTree = bvh;
  obstacles.push({ mesh, bvh });
}

/**
 * 建物グループから簡略コライダー（ボックス）を作って登録する便利関数。
 * 配置（回転）前のローカル状態で呼ぶこと（identity・等倍スケール前提）。
 * 生成した不可視ボックスは building の子として追加されるので、配置時の変換に追従する。
 */
export function addBuildingCollider(building: THREE.Object3D): THREE.Mesh {
  building.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(building);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const geo = new THREE.BoxGeometry(
    Math.max(size.x, 0.05),
    Math.max(size.y, 0.05),
    Math.max(size.z, 0.05),
  );
  const collider = new THREE.Mesh(geo, colliderMaterial);
  collider.position.copy(center);
  collider.visible = false;
  collider.name = 'collider';
  building.add(collider);

  registerObstacle(collider);
  return collider;
}

// --- resolveCollisions 用の使い回しオブジェクト（GC削減） ---
const _segment = new THREE.Line3();
const _box = new THREE.Box3();
const _triPoint = new THREE.Vector3();
const _capPoint = new THREE.Vector3();
const _inv = new THREE.Matrix4();
const _scale = new THREE.Vector3();
const _delta = new THREE.Vector3();

/**
 * プレイヤー（カプセル）と全建物の衝突を解決し、押し返した後の位置を返す。
 * @param playerPos プレイヤー原点（カプセル中心）
 * @param upDir     その地点の上方向（球面法線）
 * @returns 押し返し後の位置（新しい Vector3）
 */
export function resolveCollisions(playerPos: THREE.Vector3, upDir: THREE.Vector3): THREE.Vector3 {
  const result = playerPos.clone();
  if (obstacles.length === 0) return result;

  const segHalf = Math.max(0, (PLAYER_HEIGHT - 2 * PLAYER_RADIUS) / 2);

  for (const ob of obstacles) {
    const mesh = ob.mesh;
    mesh.updateWorldMatrix(true, false); // 建物は静的なので軽い
    _inv.copy(mesh.matrixWorld).invert();
    const uniformScale = _scale.setFromMatrixScale(mesh.matrixWorld).x || 1;
    const localRadius = PLAYER_RADIUS / uniformScale;

    // ワールドのカプセル両端 → コライダーのローカル空間へ
    _segment.start.copy(result).addScaledVector(upDir, -segHalf).applyMatrix4(_inv);
    _segment.end.copy(result).addScaledVector(upDir, segHalf).applyMatrix4(_inv);

    // カプセルを囲む AABB（枝刈り用）
    _box.makeEmpty();
    _box.expandByPoint(_segment.start);
    _box.expandByPoint(_segment.end);
    _box.min.addScalar(-localRadius);
    _box.max.addScalar(localRadius);

    ob.bvh.shapecast({
      intersectsBounds: (bounds) => bounds.intersectsBox(_box),
      intersectsTriangle: (tri: ExtendedTriangle) => {
        // 三角形とカプセル芯線の最近接距離
        const dist = tri.closestPointToSegment(_segment, _triPoint, _capPoint);
        if (dist < localRadius) {
          const depth = localRadius - dist;
          _delta.copy(_capPoint).sub(_triPoint);
          if (_delta.lengthSq() < 1e-12) return false; // 退避方向不定はスキップ
          _delta.normalize();
          // 芯線ごと押し出す（以降の三角形は更新後の芯線で判定）
          _segment.start.addScaledVector(_delta, depth);
          _segment.end.addScaledVector(_delta, depth);
        }
        return false;
      },
    });

    // 補正後カプセル中心（ローカル）→ ワールドへ戻す
    result
      .copy(_segment.start)
      .add(_segment.end)
      .multiplyScalar(0.5)
      .applyMatrix4(mesh.matrixWorld);
  }

  return result;
}
