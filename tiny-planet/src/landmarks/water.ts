import * as THREE from 'three';

/**
 * 倉敷川の水面マテリアル（様式化）。
 * MeshStandardMaterial を onBeforeCompile で拡張し、
 * 時間で揺れる細かな波（法線の揺らぎ）＋環境マップの映り込みで「きれいな川」感を出す。
 * 標準マテリアルベースなので IBL・ライト・Bloom がそのまま効く。
 */
export interface CanalWater {
  material: THREE.MeshStandardMaterial;
  /** 経過秒を渡して波をアニメーションさせる */
  update: (elapsed: number) => void;
}

export function createCanalWater(): CanalWater {
  const material = new THREE.MeshStandardMaterial({
    color: 0x5fa6a0, // 倉敷川の青緑
    roughness: 0.12, // 低めで反射を効かせる
    metalness: 0.2,
    transparent: true,
    opacity: 0.9,
    envMapIntensity: 1.5,
  });

  let uTime: { value: number } | null = null;

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    uTime = shader.uniforms.uTime;

    // ワールド座標を fragment へ渡す（begin_vertex は常に存在）
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWorldPosW;')
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\n  vWorldPosW = (modelMatrix * vec4(transformed, 1.0)).xyz;',
      );

    // 法線をさざ波で揺らす（lit 計算前の normal を加工）
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;\nvarying vec3 vWorldPosW;')
      .replace(
        '#include <normal_fragment_begin>',
        `#include <normal_fragment_begin>
        {
          vec2 p = vWorldPosW.xz * 1.7;
          vec3 ripple = vec3(
            sin(p.x * 3.0 + uTime * 1.3) + sin(p.y * 2.1 - uTime * 1.1),
            0.0,
            cos(p.y * 2.7 + uTime * 0.9) + cos(p.x * 1.7 - uTime * 1.4)
          ) * 0.05;
          normal = normalize(normal + ripple);
        }`,
      );
  };

  return {
    material,
    update: (elapsed: number) => {
      if (uTime) uTime.value = elapsed;
    },
  };
}
