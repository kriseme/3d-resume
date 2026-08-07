import * as THREE from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { resume } from './data/resume';
import { renderResume } from './render';
import './style.css';

gsap.registerPlugin(ScrollTrigger);

const canvas = document.querySelector<HTMLCanvasElement>('#scene');
const track = document.querySelector<HTMLElement>('#track');
const loadingEl = document.querySelector<HTMLElement>('#loading');

if (!canvas || !track) {
  throw new Error('页面缺少必要元素：<canvas id="scene"> 或 <main id="track">');
}

const isDesktopQuery = window.matchMedia('(min-width: 768px) and (pointer: fine)');
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('draco/');
const heroContentEl = document.querySelector<HTMLElement>('#hero-content');
const heroHintEl = document.querySelector<HTMLElement>('#hero-hint');
const resumeCardEl = document.querySelector<HTMLElement>('#resume-card');
const finalAccentEl = document.querySelector<HTMLElement>('#final-accent');

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();

const FOV0 = 38;
let camZ0 = 2.0;
let camY0 = 0.62;
let camZ1 = 0.55;
let camY1 = 0.52;

const camera = new THREE.PerspectiveCamera(FOV0, window.innerWidth / window.innerHeight, 0.1, 30);
camera.position.set(0, camY0, camZ0);
camera.lookAt(0, camY0, 0);

scene.add(new THREE.AmbientLight(0xffffff, 1.0));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.7);
keyLight.position.set(1.2, 2.2, 2.0);
scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0xcfe0ff, 0.9);
rimLight.position.set(-1.5, 1.0, 1.8);
scene.add(rimLight);
const hemiLight = new THREE.HemisphereLight(0xffffff, 0xdbe6f2, 0.55);
scene.add(hemiLight);

const dustCount = 120;
const dustGeometry = new THREE.BufferGeometry();
const dustPositions = new Float32Array(dustCount * 3);
for (let i = 0; i < dustCount; i += 1) {
  dustPositions[i * 3] = (Math.random() - 0.5) * 12;
  dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 7;
  dustPositions[i * 3 + 2] = -1.5 - Math.random() * 5;
}
dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
const dust = new THREE.Points(
  dustGeometry,
  new THREE.PointsMaterial({
    color: 0x9db8d8,
    size: 0.035,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  }),
);
scene.add(dust);

let vrm: VRM | null = null;
let character: THREE.Object3D | null = null;
let characterPivot: THREE.Group | null = null;
const MODEL_URL = 'models/character.glb';
const FALLBACK_MODEL_URL = 'models/sample.vrm';
const CHARACTER_BASE_Y = -0.82;
let characterLocalY = CHARACTER_BASE_Y;
let finalX = 0;

const EXPRESSION_NAMES = ['happy', 'angry', 'sad', 'relaxed', 'surprised', 'neutral'] as const;
type ExpressionName = (typeof EXPRESSION_NAMES)[number];

const expressionValues: Record<ExpressionName, number> = {
  happy: 0,
  angry: 0,
  sad: 0,
  relaxed: 0,
  surprised: 0,
  neutral: 0,
};

const chapterExpressions: Record<string, Partial<Record<ExpressionName, number>>> = {
  zoom: { surprised: 0.55 },
  hero: { relaxed: 0.2 },
  edu: { relaxed: 0.75 },
  projects: { happy: 0.7 },
  skills: { neutral: 0.65 },
  honors: { happy: 0.8 },
  final: { happy: 0.85 },
};

const chapterPoses: Record<string, { x: number; y: number }> = {
  edu: { x: -0.12, y: 0.28 },
  projects: { x: -0.12, y: -0.28 },
  skills: { x: 0.12, y: 0.28 },
  honors: { x: 0.12, y: -0.28 },
};

const pose = { x: 0, y: 0 };
let currentChapter = 'hero';
let nextBlinkAt = 2 + Math.random() * 2;
let blinkStartedAt = -10;

function computeFraming(): void {
  if (!character) return;
  const box = new THREE.Box3().setFromObject(character);
  const height = box.max.y - box.min.y;
  const headTop = box.max.y;
  const faceY = box.min.y + height * 0.87;

  // 初始构图：胸部以下、腰部以上裁切，头顶留出空间（半身像）
  const bottom0 = box.min.y - height * 0.42;
  const top0 = headTop + height * 0.18;
  camY0 = (bottom0 + top0) / 2;
  const halfH0 = (top0 - bottom0) / 2;
  camZ0 = halfH0 / Math.tan(THREE.MathUtils.degToRad(FOV0 / 2));

  // 变焦特写：只保留面部到头顶
  const bottom1 = faceY - height * 0.08;
  const top1 = headTop + height * 0.02;
  camY1 = (bottom1 + top1) / 2;
  const halfH1 = (top1 - bottom1) / 2;
  camZ1 = halfH1 / Math.tan(THREE.MathUtils.degToRad(FOV0 / 2));

  if (isDesktopQuery.matches) updateProgress(lastProgress);
}

function normalizeCharacter(): void {
  if (!character) return;
  const box = new THREE.Box3().setFromObject(character);
  character.position.y -= box.min.y;
}

function setupPivotAndFraming(): void {
  if (!character) return;
  const pivot = new THREE.Group();
  scene.add(pivot);
  pivot.add(character);
  characterPivot = pivot;
  const box = new THREE.Box3().setFromObject(character);
  const height = box.max.y - box.min.y;
  const pivotY = CHARACTER_BASE_Y + height * 0.7;
  pivot.position.set(0, pivotY, 0);
  characterLocalY = CHARACTER_BASE_Y - pivotY;
  character.position.y = characterLocalY;
  computeFraming();
}

function setupVrmLookAt(loaded: VRM): void {
  const lookTarget = new THREE.Object3D();
  lookTarget.position.set(0, 0.55, 1.2);
  scene.add(lookTarget);
  if (loaded.lookAt) {
    loaded.lookAt.target = lookTarget;
  }
  window.addEventListener('pointermove', (event) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;
    lookTarget.position.set(x * 1.2, 0.55 + y * 0.6, 1.2);
  });
}

function forceAlbedoMaterial(root: THREE.Object3D): void {
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      if (
        material instanceof THREE.MeshStandardMaterial ||
        material instanceof THREE.MeshPhysicalMaterial
      ) {
        material.metalness = 0;
        material.roughness = 1;
        material.envMapIntensity = 0;
        if (material instanceof THREE.MeshPhysicalMaterial) {
          material.specularIntensity = 0;
        }
        material.needsUpdate = true;
      }
    }
  });
}

async function loadCharacter(): Promise<void> {
  try {
    const plainLoader = new GLTFLoader();
    plainLoader.setDRACOLoader(dracoLoader);
    const gltf = await plainLoader.loadAsync(MODEL_URL);
    character = gltf.scene;
    vrm = null;
    forceAlbedoMaterial(character);
    normalizeCharacter();
    setupPivotAndFraming();
  } catch (error) {
    console.warn('character.glb 加载失败，回退到示例 VRM：', error);
    try {
      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);
      loader.register((parser) => new VRMLoaderPlugin(parser));
      const gltf = await loader.loadAsync(FALLBACK_MODEL_URL);
      const loaded = gltf.userData.vrm as VRM | undefined;
      if (!loaded) throw new Error('该文件不是有效的 VRM 模型');
      vrm = loaded;
      VRMUtils.removeUnnecessaryVertices(loaded.scene);
      character = loaded.scene;
      forceAlbedoMaterial(character);
      normalizeCharacter();
      setupPivotAndFraming();
      setupVrmLookAt(loaded);
    } catch (fallbackError) {
      console.error('所有模型加载失败：', fallbackError);
    }
  } finally {
    loadingEl?.classList.add('hidden');
  }
}

const clock = new THREE.Clock();

function updateCharacter(delta: number): void {
  if (!character) return;
  const t = clock.elapsedTime;

  const targetPose = chapterPoses[currentChapter] ?? { x: 0, y: 0 };
  pose.x += (targetPose.x - pose.x) * Math.min(1, delta * 4);
  pose.y += (targetPose.y - pose.y) * Math.min(1, delta * 4);
  if (characterPivot) {
    characterPivot.rotation.x = pose.x;
    characterPivot.rotation.y = pose.y;
    characterPivot.position.x = finalX;
  }

  character.position.y = characterLocalY + Math.sin(t * 1.3) * 0.012;
  character.rotation.y = Math.sin(t * 0.45) * 0.04;

  const humanoid = vrm?.humanoid;
  const spine = humanoid?.getNormalizedBoneNode?.('spine');
  if (spine) spine.rotation.x = Math.sin(t * 1.1) * 0.02;

  const leftArm = humanoid?.getNormalizedBoneNode?.('leftUpperArm');
  const rightArm = humanoid?.getNormalizedBoneNode?.('rightUpperArm');
  if (leftArm) leftArm.rotation.z = 0.1 + Math.sin(t * 0.8) * 0.06;
  if (rightArm) rightArm.rotation.z = -0.1 - Math.sin(t * 0.8 + 0.7) * 0.06;

  const manager = vrm?.expressionManager;
  if (manager) {
    if (t > nextBlinkAt) {
      blinkStartedAt = t;
      nextBlinkAt = t + 2.4 + Math.random() * 3.2;
    }
    const blink = Math.max(0, 1 - Math.abs(t - blinkStartedAt - 0.09) / 0.09);
    const targets = chapterExpressions[currentChapter] ?? {};
    for (const name of EXPRESSION_NAMES) {
      const target = targets[name] ?? 0;
      expressionValues[name] += (target - expressionValues[name]) * Math.min(1, delta * 6);
      manager.setValue(name, expressionValues[name]);
    }
    manager.setValue('blink', blink);
  }

  vrm?.update(delta);
}

const FINAL_START = 0.9;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(value: number): number {
  const x = clamp01(value);
  return x * x * (3 - 2 * x);
}

let lastProgress = 0;
let lyricCards: { el: HTMLElement; center: number }[] = [];
const timelineSection = document.querySelector<HTMLElement>('#chapter-timeline');

function cacheLyricCenters(): void {
  if (!timelineSection) return;
  lyricCards = Array.from(document.querySelectorAll<HTMLElement>('.timeline-card')).map((el) => ({
    el,
    center: timelineSection.offsetTop + el.offsetTop + el.offsetHeight / 2,
  }));
}

function updateProgress(progress: number): void {
  lastProgress = progress;

  // 首屏文字淡出
  const heroFade = smoothstep((progress - 0.015) / 0.06);
  if (heroContentEl) {
    heroContentEl.style.opacity = String(1 - heroFade);
    heroContentEl.style.transform = `translate(-50%, -50%) translateY(${-90 * heroFade}px)`;
  }
  if (heroHintEl) {
    heroHintEl.style.opacity = String(1 - smoothstep((progress - 0.025) / 0.03));
  }

  // 最终简历卡滑入 + 人物回归
  if (progress >= FINAL_START) {
    const f = smoothstep((progress - FINAL_START) / (1 - FINAL_START));
    const eased = 1 - (1 - f) * (1 - f);
    if (resumeCardEl) {
      resumeCardEl.style.transform = `translateY(-50%) translateX(${(1 - eased) * 105}%)`;
    }
    if (finalAccentEl) {
      finalAccentEl.style.opacity = String(f);
      finalAccentEl.style.transform = `translateY(${(1 - f) * 30}px)`;
    }
  } else {
    if (resumeCardEl) resumeCardEl.style.transform = 'translateY(-50%) translateX(105%)';
    if (finalAccentEl) {
      finalAccentEl.style.opacity = '0';
      finalAccentEl.style.transform = 'translateY(30px)';
    }
  }

  // 首屏：人物向前轻微放大（不做 FOV 拉伸变焦），最终页回归初始
  const INTRO_ZOOM = 0.25;
  const zoomIn = smoothstep((progress - 0.02) / 0.1);
  const revert = smoothstep((progress - FINAL_START) / 0.08);
  const effectiveZoom = zoomIn * INTRO_ZOOM * (1 - revert);

  const heroZ0 = camZ0 / 1.2;
  const baseZ = THREE.MathUtils.lerp(heroZ0, camZ0, revert);
  camera.position.z = THREE.MathUtils.lerp(baseZ, camZ1, effectiveZoom);
  camera.position.y = THREE.MathUtils.lerp(camY0, camY1, effectiveZoom);
  camera.fov = FOV0;
  camera.lookAt(0, camera.position.y, 0);
  camera.updateProjectionMatrix();

  currentChapter =
    progress < 0.02
      ? 'hero'
      : progress < 0.14
        ? 'zoom'
        : progress < 0.18
        ? 'hero'
        : progress < 0.36
        ? 'edu'
        : progress < 0.54
          ? 'projects'
          : progress < 0.72
            ? 'skills'
            : progress < 0.9
              ? 'honors'
              : 'final';

  if (progress >= FINAL_START) {
    const f = smoothstep((progress - FINAL_START) / (1 - FINAL_START));
    const halfWidth =
      Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z * camera.aspect;
    finalX = THREE.MathUtils.lerp(0, -halfWidth * 0.5, f);
  } else {
    finalX = 0;
  }

  const dotIndex =
    progress < 0.18
      ? 0
      : progress < 0.36
        ? 1
        : progress < 0.54
          ? 2
          : progress < 0.72
            ? 3
            : progress < 0.9
              ? 4
              : 5;
  document.querySelectorAll<HTMLElement>('.progress-dot').forEach((dot, index) => {
    dot.classList.toggle('active', index === dotIndex);
  });

  // 歌词式滚动：文字只在屏幕中线附近显现
  const viewportCenter = window.innerHeight / 2;
  const scrollCenter = window.scrollY + viewportCenter;
  const range = window.innerHeight * 0.4;
  for (const { el, center } of lyricCards) {
    const dist = Math.abs(center - scrollCenter);
    const t = 1 - Math.min(1, dist / range);
    el.style.opacity = String(t);
    el.style.transform = `translateY(${(1 - t) * 14}px) scale(${0.96 + 0.04 * t})`;
  }
}

const mm = gsap.matchMedia();

let targetProgress = 0;
let smoothedProgress = 0;
let lastProgressTime = performance.now();

mm.add('(min-width: 768px) and (pointer: fine)', () => {
  const st = ScrollTrigger.create({
    trigger: track,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      targetProgress = self.progress;
    },
    onRefresh: (self) => {
      targetProgress = self.progress;
    },
  });

  const heroEl = document.querySelector<HTMLElement>('#chapter-hero');
  const onHeroClick = (): void => {
    const target = (track.offsetHeight - window.innerHeight) * 0.1;
    if (window.scrollY < target - 40) {
      window.scrollTo({ top: target, behavior: 'smooth' });
    }
  };
  heroEl?.addEventListener('click', onHeroClick);

  updateProgress(0);
  smoothedProgress = 0;
  targetProgress = 0;

  return () => {
    st.kill();
    heroEl?.removeEventListener('click', onHeroClick);
  };
});

const resumeCard = document.querySelector<HTMLElement>('#resume-card');
const finalSection = document.querySelector<HTMLElement>('#chapter-final');
if (resumeCard && finalSection) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        resumeCard.classList.toggle('visible', entry.isIntersecting);
      });
    },
    { threshold: 0.15 },
  );
  observer.observe(finalSection);
}

document.querySelectorAll<HTMLElement>('.progress-dot').forEach((dot) => {
  dot.addEventListener('click', () => {
    const index = Number(dot.dataset.target ?? 0);
    const thresholds = [0.05, 0.27, 0.45, 0.63, 0.81, 0.95];
    window.scrollTo({
      top: (track.offsetHeight - window.innerHeight) * thresholds[index],
      behavior: 'smooth',
    });
  });
});

document.querySelector('#print-btn')?.addEventListener('click', () => window.print());

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (isDesktopQuery.matches) updateProgress(smoothedProgress);
  requestAnimationFrame(cacheLyricCenters);
});

function animate(): void {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  if (isDesktopQuery.matches) {
    const now = performance.now();
    const progressDelta = Math.min(0.5, (now - lastProgressTime) / 1000);
    lastProgressTime = now;
    smoothedProgress += (targetProgress - smoothedProgress) * Math.min(1, progressDelta * 1.8);
    updateProgress(smoothedProgress);
  }
  dust.rotation.y += delta * 0.03;
  dust.rotation.x += delta * 0.005;
  updateCharacter(delta);
  if (document.visibilityState === 'visible') {
    renderer.render(scene, camera);
  }
}

renderResume(resume);
cacheLyricCenters();
window.addEventListener('load', cacheLyricCenters);
document.fonts?.ready.then(() => cacheLyricCenters()).catch(() => {});
void loadCharacter();
animate();
