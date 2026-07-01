import * as THREE from 'three';
import { createPlanet, PLANET_RADIUS } from './planet/createPlanet';
import { PlanetCharacterController, InputState } from './controller/PlanetCharacterController';
import { CameraRig } from './controller/cameraRig';
import { fibonacciSphere, orientToSurface } from './utils/sphereMath';
import { SurfacePatch } from './geo/surfacePatch';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildBikanDistrict } from './landmarks/bikanDistrict';
import { makeOkayamaCastle } from './landmarks/okayamaCastle';
import { PortalManager } from './interaction/portals';
import { placeModel } from './geo/loadModel';
import { createPostFX } from './fx/postprocess';
import { makeTree } from './landmarks/trees';
import { createMomotaro, updateAnimation, AnimationState } from './momotaroCharacter';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { normalizeModel } from './geo/loadModel';
import { buildKorakuen } from './landmarks/korakuen';
import { buildKibitsujinja } from './landmarks/kibitsujinja';
import { buildMomotaroStation } from './landmarks/momotaroStation';
import { buildKibiPlain } from './landmarks/kibiPlain';
import { buildPeachOrchard } from './landmarks/peachOrchard';

// ---------- シーン基盤 ----------
const app = document.getElementById('app')!;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0f1a);
scene.fog = new THREE.Fog(0x0b0f1a, PLANET_RADIUS * 3, PLANET_RADIUS * 7);

// 環境光（IBL）: 金属/水面の映り込みを成立させ、全体をやわらかく持ち上げる
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, PLANET_RADIUS + 10, PLANET_RADIUS + 10);

// ---------- ライティング（やわらかめ） ----------
const hemi = new THREE.HemisphereLight(0xcfe0ff, 0x4a4458, 1.0);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1d6, 1.6);
sun.position.set(30, 40, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 120;
const shadowCam = sun.shadow.camera as THREE.OrthographicCamera;
shadowCam.left = -PLANET_RADIUS * 1.5;
shadowCam.right = PLANET_RADIUS * 1.5;
shadowCam.top = PLANET_RADIUS * 1.5;
shadowCam.bottom = -PLANET_RADIUS * 1.5;
scene.add(sun);

// 逆光側のやわらかいフィルライト（影側の面が黒つぶれしないように）
const fill = new THREE.DirectionalLight(0x9fb8e0, 0.5);
fill.position.set(-25, 10, -20);
scene.add(fill);

// 星空っぽい点を散らす
{
  const starGeo = new THREE.BufferGeometry();
  const starCount = 600;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const v = new THREE.Vector3()
      .randomDirection()
      .multiplyScalar(PLANET_RADIUS * 8 + Math.random() * PLANET_RADIUS * 4);
    positions.set([v.x, v.y, v.z], i * 3);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, sizeAttenuation: true }),
  );
  scene.add(stars);
}

// ---------- 惑星 ----------
const planet = createPlanet();
scene.add(planet);

// ---------- F2-8: プレースホルダーをランドマークに差し替え ----------
// 美観地区パッチ（惑星の頂点付近）
const districtDir = new THREE.Vector3(0, 1, 0);
const districtPatch = new SurfacePatch(districtDir, PLANET_RADIUS, planet);
const { waterUpdate } = buildBikanDistrict(scene, districtPatch);

// 岡山城パッチ（美観地区の前方=運河の延長線上、少し離れた位置）
const castleAngle = THREE.MathUtils.degToRad(40);
const castleDir = new THREE.Vector3(0, Math.cos(castleAngle), Math.sin(castleAngle));
const castlePatch = new SurfacePatch(castleDir, PLANET_RADIUS, planet);
// 高精細モデル（public/models/okayama-castle.glb）があればそれを使い、
// 無ければ手作りの様式化版にフォールバックする。
placeModel(scene, castlePatch, import.meta.env.BASE_URL + 'models/okayama-castle.glb', 0, 0, {
  targetHeight: 12,
}).then((model) => {
  if (!model) {
    const castle = makeOkayamaCastle();
    castlePatch.place(castle, 0, 0, 0, 0);
    scene.add(castle);
  }
});

// ---------- 建物ポータル（MVP: 近づくと案内、Eキーでサイトへ） ----------
const portalManager = new PortalManager();
portalManager.add({
  name: '岡山城',
  // 城の足元（地表点）を反応中心にする
  position: castlePatch.surfacePointAt(0, 0),
  radius: 4.5,
  // TODO: ハッカソンの実URLに差し替え
  url: 'https://example.com',
});

// ---------- 岡山ランドマークを惑星全体に分散配置（既存2つと合わせて7か所） ----------
const landmarkDirs: THREE.Vector3[] = [districtDir, castleDir];
function makePatch(dir: THREE.Vector3): SurfacePatch {
  landmarkDirs.push(dir);
  return new SurfacePatch(dir, PLANET_RADIUS, planet);
}

const korakuenPatch = makePatch(new THREE.Vector3(1, 0.15, 0).normalize());
portalManager.add({ name: '後楽園', position: buildKorakuen(scene, korakuenPatch), radius: 5, url: 'https://example.com/korakuen' });

const kibitsuPatch = makePatch(new THREE.Vector3(-1, 0.1, 0.2).normalize());
portalManager.add({ name: '吉備津神社', position: buildKibitsujinja(scene, kibitsuPatch), radius: 5, url: 'https://example.com/kibitsu' });

const kibiPlainPatch = makePatch(new THREE.Vector3(-0.3, -0.4, -0.85).normalize());
portalManager.add({ name: '吉備路（備中国分寺）', position: buildKibiPlain(scene, kibiPlainPatch), radius: 5, url: 'https://example.com/kibiji' });

const peachPatch = makePatch(new THREE.Vector3(0.8, -0.2, -0.55).normalize());
portalManager.add({ name: '白桃畑', position: buildPeachOrchard(scene, peachPatch), radius: 5, url: 'https://example.com/peach' });

// 桃太郎駅前（スポーン地点）
const stationDir = new THREE.Vector3(0.2, -0.5, 0.85).normalize();
const stationPatch = makePatch(stationDir);
const station = buildMomotaroStation(scene, stationPatch);
portalManager.add({ name: '岡山駅前 桃太郎像', position: station.portal, radius: 5, url: 'https://example.com/station' });

// 惑星に賑わいを足す散在の木（各ランドマークの近くは避ける）
function scatterTrees(): void {
  const dirs = fibonacciSphere(80);
  for (const dir of dirs) {
    if (landmarkDirs.some((ld) => dir.dot(ld) > 0.9)) continue; // パッチ付近は除外
    // 表面に合わせる外側グループ＋木本体（木自身の傾きを保つため入れ子にする）
    const anchor = new THREE.Group();
    anchor.position.copy(dir).multiplyScalar(PLANET_RADIUS);
    anchor.quaternion.copy(orientToSurface(dir, new THREE.Vector3(0, 0, 1)));
    anchor.add(makeTree());
    scene.add(anchor);
  }
}
scatterTrees();

// ---------- キャラクター（cubone.glb を優先、無ければ桃太郎にフォールバック） ----------
const FEET_OFFSET = 0.65; // 原点（=コントローラ位置）から足までの距離。ミニチュア体型に合わせる
const PLAYER_TARGET_HEIGHT = 1.4; // モデルの目標の高さ（自動スケール）
const PLAYER_BASE_Y = -FEET_OFFSET; // モデルを charGroup 内で下げる量（足元を接地させる）

const charGroup = new THREE.Group();
scene.add(charGroup);

let playerModel: THREE.Object3D | null = null;
let proceduralRig = false; // 桃太郎の手作りリグを動かすときだけ true

function useFallbackMomotaro(): void {
  const m = createMomotaro();
  m.position.y = PLAYER_BASE_Y;
  m.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).castShadow = true;
  });
  charGroup.add(m);
  playerModel = m;
  proceduralRig = true;
}

// cubone.glb を読み込んでプレイヤーの見た目にする
new GLTFLoader().load(
  import.meta.env.BASE_URL + 'models/cubone.glb',
  (gltf) => {
    const model = normalizeModel(gltf.scene, PLAYER_TARGET_HEIGHT);
    model.position.y = PLAYER_BASE_Y;
    model.rotation.y = Math.PI; // モデルの正面をゲームの前方(-Z)に合わせる（逆向きなら 0 にする）
    model.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    charGroup.add(model);
    playerModel = model;
    proceduralRig = false;
  },
  undefined,
  (err) => {
    console.warn('[player] cubone.glb の読み込みに失敗。桃太郎にフォールバックします', err);
    useFallbackMomotaro();
  },
);

// 桃太郎駅前広場をスポーン地点にする
const startDir = stationPatch.dirAt(station.spawnLocal[0], station.spawnLocal[1]);
const startPos = startDir.clone().multiplyScalar(PLANET_RADIUS + FEET_OFFSET);
const controller = new PlanetCharacterController(charGroup, planet, FEET_OFFSET, startPos);
controller.facing.copy(stationPatch.forward);
const cameraRig = new CameraRig(camera, renderer.domElement);

// ---------- 入力 ----------
const keys = new Set<string>();
window.addEventListener('keydown', (e) => {
  keys.add(e.code);
  if (e.code === 'Space') e.preventDefault();
});
window.addEventListener('keyup', (e) => keys.delete(e.code));

// E キーで近くの建物ポータルに入場（ユーザー操作起点で window.open を呼ぶ）
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyE') portalManager.enter();
});

function readInput(): InputState {
  const forward =
    (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) -
    (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0);
  const right =
    (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) -
    (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);
  return { forward, right, jump: keys.has('Space'), run: keys.has('ShiftLeft') || keys.has('ShiftRight') };
}

// ---------- ポストプロセス（ティルトシフト＋Bloom） ----------
const postfx = createPostFX(renderer, scene, camera);

// ---------- リサイズ ----------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  postfx.setSize(window.innerWidth, window.innerHeight);
});

// ---------- ループ ----------
const clock = new THREE.Clock();
let elapsed = 0;
const _prevPos = controller.position.clone();
function animate(): void {
  // デバッグ用の一時停止フラグ（描画は続けつつ、操作・カメラ追従だけ止める）
  const paused = import.meta.env.DEV && (window as unknown as { __pause?: boolean }).__pause;
  if (!paused) {
    const dt = Math.min(clock.getDelta(), 0.05); // 大きすぎるステップを抑制
    elapsed += dt;
    controller.update(dt, readInput(), camera);
    cameraRig.update(controller.position, controller.up, controller.facing, controller.isMoving);
    portalManager.update(controller.position);
    waterUpdate(elapsed); // 川面の波をアニメーション

    // 実速度からアニメ状態を決めて更新
    const speed = dt > 0 ? controller.position.distanceTo(_prevPos) / dt : 0;
    _prevPos.copy(controller.position);
    let state: AnimationState;
    if (!controller.isGrounded) state = 'jump';
    else if (speed < 0.3) state = 'idle';
    else if (speed > 9) state = 'run';
    else state = 'walk';

    if (playerModel) {
      if (proceduralRig) {
        // 桃太郎: 手作りリグのボーン回転
        updateAnimation(playerModel as THREE.Group, state, elapsed, dt);
      } else {
        // glb: 簡単な上下ボブで生命感を出す
        const moving = state === 'walk' || state === 'run';
        const bob = moving
          ? Math.abs(Math.sin(elapsed * (state === 'run' ? 16 : 11))) * 0.05
          : Math.sin(elapsed * 2.0) * 0.012;
        playerModel.position.y = PLAYER_BASE_Y + bob;
      }
    }
  }
  postfx.render();
  requestAnimationFrame(animate);
}

// 初期カメラを背後に置いてから開始
cameraRig.update(controller.position, controller.up, controller.facing, false);
animate();

// 開発時のデバッグ用にコア状態を公開（本番ビルドでは無効）
if (import.meta.env.DEV) {
  (window as unknown as { __planet: unknown }).__planet = {
    controller,
    cameraRig,
    portalManager,
    postfx,
    charGroup,
    get playerModel() {
      return playerModel;
    },
    waterUpdate,
    camera,
    keys,
    scene,
    renderer,
    THREE,
    PLANET_RADIUS,
    FEET_OFFSET,
  };
}
