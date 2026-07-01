import * as THREE from 'three';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';

// three-mesh-bvh を THREE のプロトタイプに組み込む（一度だけ）。
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

/** 惑星の定数（設計書 5.1 の目安値）。調整はここで行う。 */
export const PLANET_RADIUS = 15;
// 分割数を上げて面のカクつき・シルエットの角を抑える。
// IcosahedronGeometry の三角形数は 20*(detail+1)^2。detail=12 で約3380三角形 ≒ なめらかな球面。
export const PLANET_DETAIL = 12;

/**
 * F1-1 / F1-2:
 * IcosahedronGeometry で球状の地面を生成し、BVH を構築したメッシュを返す。
 */
export function createPlanet(
  radius = PLANET_RADIUS,
  detail = PLANET_DETAIL,
): THREE.Mesh {
  const geometry = new THREE.IcosahedronGeometry(radius, detail);
  // 法線をなめらかに（スムースシェーディング）。高分割と合わせて球面をなめらかに見せる。
  geometry.computeVertexNormals();

  // F1-2: BVH を構築（以降このメッシュへの raycast が高速化される）。
  geometry.computeBoundsTree();

  const material = new THREE.MeshStandardMaterial({
    color: 0x5a8f6b,
    flatShading: false,
    roughness: 0.95,
    metalness: 0.0,
  });

  const planet = new THREE.Mesh(geometry, material);
  planet.name = 'planet';
  planet.castShadow = false;
  planet.receiveShadow = true;
  return planet;
}
