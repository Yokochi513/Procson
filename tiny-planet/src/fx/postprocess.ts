import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { HorizontalTiltShiftShader } from 'three/examples/jsm/shaders/HorizontalTiltShiftShader.js';
import { VerticalTiltShiftShader } from 'three/examples/jsm/shaders/VerticalTiltShiftShader.js';

/**
 * ポストプロセス（描画後の演出）。
 * - ティルトシフト風DoF: 画面の上下をぼかし中央を残す → 「小さな惑星のミニチュア感」
 * - Bloom: 金の鯱や水面のきらめきがふわっと発光
 * - OutputPass: ACESトーンマッピング＋sRGB変換を最終段で正しく適用
 *
 * すべて three の標準モジュールのみで構成（追加依存なし・軽量）。
 */
export interface PostFX {
  render: () => void;
  setSize: (w: number, h: number) => void;
}

export function createPostFX(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
): PostFX {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  // 明るい部分だけをふんわり発光（しきい値高めで全体が白飛びしないように）
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.32, 0.45, 0.85);
  composer.addPass(bloom);

  // ティルトシフト（水平・垂直の2パスでガウスぼかし、focus 帯はくっきり残す）
  const focus = 0.6; // 0=画面上端, 1=下端。キャラのいる中央やや下をシャープに
  const blur = 2.4; // ぼかしの強さ
  const hts = new ShaderPass(HorizontalTiltShiftShader);
  const vts = new ShaderPass(VerticalTiltShiftShader);
  (hts.uniforms['r'] as THREE.IUniform).value = focus;
  (vts.uniforms['r'] as THREE.IUniform).value = focus;
  composer.addPass(hts);
  composer.addPass(vts);

  composer.addPass(new OutputPass());

  function setSize(w: number, h: number): void {
    composer.setSize(w, h);
    bloom.setSize(w, h);
    (hts.uniforms['h'] as THREE.IUniform).value = blur / w;
    (vts.uniforms['v'] as THREE.IUniform).value = blur / h;
  }
  setSize(window.innerWidth, window.innerHeight);

  return {
    render: () => composer.render(),
    setSize,
  };
}
