import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { resume } from './data/resume';
import { renderResume } from './render';
import './style.css';

gsap.registerPlugin(ScrollTrigger);

const video = document.querySelector<HTMLVideoElement>('#bg-video');
const track = document.querySelector<HTMLElement>('#track');
const heroContentEl = document.querySelector<HTMLElement>('#hero-content');
const heroHintEl = document.querySelector<HTMLElement>('#hero-hint');
const resumeCardEl = document.querySelector<HTMLElement>('#resume-card');
const finalAccentEl = document.querySelector<HTMLElement>('#final-accent');
const timelineSection = document.querySelector<HTMLElement>('#chapter-timeline');

// 国内访问 GitHub 视频很慢：中文环境下优先从国内代理把视频拉成内存 Blob，
// 加载和拖动都会更快；代理全部失败时自动回退到 GitHub 原地址。
const FAST_VIDEO_PROXIES = [
  'https://ghproxy.net/https://raw.githubusercontent.com/kriseme/3d-resume/main/public/videos/',
  'https://ghfast.top/https://raw.githubusercontent.com/kriseme/3d-resume/main/public/videos/',
];
const FAST_VIDEO_TIMEOUT_MS = 10000;

if (!track) {
  throw new Error('Missing required <main id="track"> element');
}

const isDesktopQuery = window.matchMedia('(min-width: 768px) and (pointer: fine)');
const FINAL_START = 0.9;
const BLESSINGS = ['好运 +1', '财富 +1', '幸运 +1', '美貌 +1', '快乐 +1'];

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(value: number): number {
  const x = clamp01(value);
  return x * x * (3 - 2 * x);
}

let lastProgress = -1;
let lyricCards: { el: HTMLElement; center: number }[] = [];

function cacheLyricCenters(): void {
  if (!timelineSection) return;
  lyricCards = Array.from(document.querySelectorAll<HTMLElement>('.timeline-card')).map((el) => ({
    el,
    center: timelineSection.offsetTop + el.offsetTop + el.offsetHeight / 2,
  }));
}

function updateProgress(progress: number): void {
  if (Math.abs(progress - lastProgress) < 0.00001) return;
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

  // 最终简历卡滑入
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

  // 章节圆点
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

function spawnBlessing(x: number, y: number): void {
  const el = document.createElement('div');
  el.className = 'blessing-tip';
  el.textContent = BLESSINGS[Math.floor(Math.random() * BLESSINGS.length)];
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);
  window.setTimeout(() => el.remove(), 1600);
}

function isCenterCharacterHit(clientX: number, clientY: number): boolean {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight * 0.46;
  const rx = Math.min(window.innerWidth * 0.24, 260);
  const ry = Math.min(window.innerHeight * 0.32, 340);
  const dx = (clientX - cx) / rx;
  const dy = (clientY - cy) / ry;
  return dx * dx + dy * dy <= 1;
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

  updateProgress(0);
  smoothedProgress = 0;
  targetProgress = 0;

  return () => {
    st.kill();
  };
});

const heroEl = document.querySelector<HTMLElement>('#chapter-hero');
heroEl?.addEventListener('click', (event) => {
  if (isCenterCharacterHit(event.clientX, event.clientY)) return;
  if (!isDesktopQuery.matches) return;
  const target = (track.offsetHeight - window.innerHeight) * 0.1;
  if (window.scrollY < target - 40) {
    window.scrollTo({ top: target, behavior: 'smooth' });
  }
});

const finalSection = document.querySelector<HTMLElement>('#chapter-final');
if (resumeCardEl && finalSection) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        resumeCardEl.classList.toggle('visible', entry.isIntersecting);
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

async function downloadResumePdf(): Promise<void> {
  const source = document.querySelector<HTMLElement>('#resume-card');
  if (!source) return;
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const clone = source.cloneNode(true) as HTMLElement;
  clone.id = 'pdf-clone';
  clone.style.cssText = [
    'position:fixed',
    'left:-9999px',
    'top:0',
    'width:794px',
    'padding:14px',
    'background:#ffffff',
    'overflow:visible',
    'transform:none',
    'box-shadow:none',
    'border-radius:0',
    'max-height:none',
    'height:auto',
  ].join(';');
  document.body.appendChild(clone);

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pageWidth = 210;
    const pageHeight = 297;
    const imageData = canvas.toDataURL('image/jpeg', 0.95);
    const fit = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const imageWidth = canvas.width * fit;
    const imageHeight = canvas.height * fit;
    pdf.addImage(imageData, 'JPEG', (pageWidth - imageWidth) / 2, 0, imageWidth, imageHeight);
    pdf.save(`${resume.nameZh}-${resume.role}-简历.pdf`);
  } finally {
    clone.remove();
  }
}

async function runDownloadWithFeedback(): Promise<void> {
  const button = document.querySelector<HTMLButtonElement>('#download-btn');
  if (button) {
    button.disabled = true;
    button.textContent = '生成中…';
  }
  try {
    await downloadResumePdf();
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = '下载 PDF';
    }
  }
}

let printEventFired = false;
window.addEventListener('beforeprint', () => {
  printEventFired = true;
});

document.querySelector('#print-btn')?.addEventListener('click', () => {
  printEventFired = false;
  window.print();
  window.setTimeout(() => {
    if (!printEventFired) void runDownloadWithFeedback();
  }, 400);
});

document.querySelector('#download-btn')?.addEventListener('click', () => {
  void runDownloadWithFeedback();
});

// 视频进度拖拽控制器：按视频帧率量化，且同一时间只允许一个 seek 在途，
// 避免每帧指针移动都触发一次 seek，导致视频掉帧。
const SCRUB_FPS = 24; // 与当前 landing.mp4 一致（8 秒 / 192 帧）

let videoReady = false;
let videoMaxFrame = 0;
let proxyVideoActive = false;
let lastPointerFrame = 0;
let pendingFrame = -1;
let lastRequestedFrame = -1;
let scrubBusy = false;
let lastSeekStartedAt = 0;
let seekToken = 0;
let activeSeekToken = 0;
let touchScrubbing = false;
let heroInteractive = true;
let clickLockUntil = 0;
let pointerDownX = -1;
let pointerDownY = -1;
let pointerMoved = false;

function frameFromClientX(clientX: number): number {
  if (videoMaxFrame <= 0) return 0;
  const width = window.innerWidth || document.documentElement.clientWidth || 1;
  const progress = clamp01(clientX / width);
  return Math.round(progress * videoMaxFrame);
}

function resetVideoToStart(): void {
  if (!video || !videoReady) return;
  pendingFrame = -1;
  lastPointerFrame = 0;
  lastRequestedFrame = 0;
  scrubBusy = false;
  activeSeekToken = ++seekToken;
  try {
    video.currentTime = 0;
  } catch {
    // 忽略媒体尚未可寻址时的偶发异常
  }
}

function setHeroInteractive(enabled: boolean): void {
  if (heroInteractive === enabled) return;
  heroInteractive = enabled;
  if (!enabled) resetVideoToStart();
}

function updateHeroInteraction(): void {
  if (performance.now() < clickLockUntil) return;
  const maxScroll = track!.offsetHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  setHeroInteractive(progress < 0.005);
}

function pumpVideoScrub(): void {
  if (!video || !videoReady || !heroInteractive || pendingFrame < 0) return;
  const now = performance.now();
  if (scrubBusy) {
    // 防止某个 seek 事件不触发时把交互卡死
    if (now - lastSeekStartedAt <= 80) return;
    scrubBusy = false;
  }
  const frame = Math.max(0, Math.min(videoMaxFrame, pendingFrame));
  if (frame === lastRequestedFrame) {
    pendingFrame = -1;
    return;
  }
  lastRequestedFrame = frame;
  scrubBusy = true;
  lastSeekStartedAt = now;
  activeSeekToken = ++seekToken;
  try {
    video.currentTime = frame / SCRUB_FPS;
  } catch {
    scrubBusy = false;
    pendingFrame = -1;
  }
}

function queueVideoScrub(clientX: number): void {
  if (!videoReady || !heroInteractive) return;
  const frame = frameFromClientX(clientX);
  if (frame === lastPointerFrame) return;
  lastPointerFrame = frame;
  pendingFrame = frame;
  pumpVideoScrub();
}

function flushVideoScrub(): void {
  if (!videoReady || !heroInteractive) return;
  pendingFrame = lastPointerFrame;
  pumpVideoScrub();
}

function getVideoEndTime(): number {
  if (!video) return 0;
  if (video.seekable.length > 0) {
    const end = video.seekable.end(video.seekable.length - 1);
    if (Number.isFinite(end) && end > 0) return end;
  }
  return Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
}

function initVideo(): void {
  if (!video) return;
  videoReady = true;
  video.pause();
  videoMaxFrame = Math.max(0, Math.round(getVideoEndTime() * SCRUB_FPS) - 1);
  video.currentTime = 0;
  pendingFrame = -1;
  lastRequestedFrame = 0;
  lastPointerFrame = 0;
  scrubBusy = false;
  lastSeekStartedAt = 0;
  seekToken = 0;
  activeSeekToken = 0;
}

async function tryFastVideoProxy(): Promise<void> {
  if (!video || proxyVideoActive) return;
  const lang = (navigator.language || navigator.languages?.[0] || '').toLowerCase();
  if (!lang.startsWith('zh')) return;

  const fileName = window.matchMedia('(max-width: 767px)').matches ? 'mobile.mp4' : 'landing.mp4';
  const raw = await fetchFastVideo(fileName);
  if (!raw) return;

  const mp4 = new Blob([raw], { type: 'video/mp4' });
  proxyVideoActive = true;
  video.src = URL.createObjectURL(mp4);
  video.load();
}

function fetchFastVideo(fileName: string): Promise<Blob | null> {
  return new Promise((resolve) => {
    let settled = false;
    let pending = FAST_VIDEO_PROXIES.length;

    for (const base of FAST_VIDEO_PROXIES) {
      void (async () => {
        try {
          const controller = new AbortController();
          const timer = window.setTimeout(() => controller.abort(), FAST_VIDEO_TIMEOUT_MS);
          try {
            const response = await fetch(base + fileName, { signal: controller.signal });
            if (response.ok) {
              const blob = await response.blob();
              if (blob.size >= 1024 && !settled) {
                settled = true;
                resolve(blob);
                return;
              }
            }
          } finally {
            window.clearTimeout(timer);
          }
        } catch {
          // 单个代理失败时继续等待其他代理
        }
        pending -= 1;
        if (!settled && pending === 0) resolve(null);
      })();
    }
  });
}

video?.addEventListener('loadedmetadata', () => {
  initVideo();
});

video?.addEventListener('loadeddata', () => {
  initVideo();
});

video?.addEventListener('durationchange', () => {
  if (videoReady) videoMaxFrame = Math.max(0, Math.round(getVideoEndTime() * SCRUB_FPS) - 1);
});

video?.addEventListener('seeked', () => {
  if (seekToken === activeSeekToken) {
    scrubBusy = false;
    pumpVideoScrub();
  }
});

video?.addEventListener('error', () => {
  videoReady = false;
  scrubBusy = false;
  if (proxyVideoActive) {
    proxyVideoActive = false;
    video?.removeAttribute('src');
    video?.load();
  }
});

if (video?.readyState != null && video.readyState >= 1) {
  initVideo();
}

void tryFastVideoProxy();

window.addEventListener('pointerdown', (event) => {
  pointerDownX = event.clientX;
  pointerDownY = event.clientY;
  pointerMoved = false;
  if (event.pointerType === 'touch') touchScrubbing = true;
});

window.addEventListener('pointermove', (event) => {
  if (
    pointerDownX >= 0 &&
    Math.hypot(event.clientX - pointerDownX, event.clientY - pointerDownY) > 8
  ) {
    pointerMoved = true;
  }
  if (event.pointerType === 'touch' && !touchScrubbing) return;
  queueVideoScrub(event.clientX);
});

window.addEventListener('pointerup', (event) => {
  const wasClick = pointerDownX >= 0 && !pointerMoved;
  const clickX = event.clientX;
  const clickY = event.clientY;
  pointerDownX = -1;
  pointerDownY = -1;
  pointerMoved = false;
  touchScrubbing = false;
  if (wasClick && isCenterCharacterHit(clickX, clickY)) {
    spawnBlessing(clickX, clickY - 40);
    return;
  }
  if (wasClick) {
    clickLockUntil = performance.now() + 600;
    setHeroInteractive(false);
    return;
  }
  flushVideoScrub();
});

window.addEventListener('pointercancel', () => {
  pointerDownX = -1;
  pointerDownY = -1;
  pointerMoved = false;
  touchScrubbing = false;
  flushVideoScrub();
});

window.addEventListener('blur', () => {
  pointerDownX = -1;
  pointerDownY = -1;
  pointerMoved = false;
  touchScrubbing = false;
  flushVideoScrub();
});

window.addEventListener('resize', () => {
  if (isDesktopQuery.matches) updateProgress(smoothedProgress);
  requestAnimationFrame(cacheLyricCenters);
});

function animate(): void {
  requestAnimationFrame(animate);
  updateHeroInteraction();
  pumpVideoScrub();
  if (isDesktopQuery.matches) {
    const now = performance.now();
    const progressDelta = Math.min(0.5, (now - lastProgressTime) / 1000);
    lastProgressTime = now;
    smoothedProgress += (targetProgress - smoothedProgress) * Math.min(1, progressDelta * 1.8);
    updateProgress(smoothedProgress);
  }
}

renderResume(resume);
cacheLyricCenters();
window.addEventListener('load', cacheLyricCenters);
document.fonts?.ready.then(() => cacheLyricCenters()).catch(() => {});
animate();
