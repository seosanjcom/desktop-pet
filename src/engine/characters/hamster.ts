import type { PetEmotion, AnimationName } from "@/types/pet";
import type { CursorPos } from "@/engine/sprite-renderer";
import type { CharacterRenderer } from "./index";
import { spriteCache, drawSprite, drawZzz, drawSparkle, drawTear } from "./image-sprite";

const BASE = "./characters/hamzzi/";

const ANIMATION_IMAGES: Partial<Record<AnimationName, string>> = {
  walk: "walk",
  run: "walk",
  eat: "eat",
  sleep: "sleep",
  play: "play",
  drag: "drag",
  sit: "sit",
  groom: "sit",
  yawn: "yawn",
  lie: "lie",
};

const EMOTION_IMAGES: Record<PetEmotion, string> = {
  happy: "happy",
  sad: "sad",
  angry: "angry",
  sleepy: "sleepy",
  neutral: "default",
};

function getImageKey(emotion: PetEmotion, animation: AnimationName): string {
  if (animation === "angry") return "angry";
  const animImg = ANIMATION_IMAGES[animation];
  if (animImg) return animImg;
  return EMOTION_IMAGES[emotion] ?? "default";
}

const CROSSFADE_MS = 200;

export class HamsterRenderer implements CharacterRenderer {
  private animTime = 0;
  private preloaded = false;
  private crossfade = { currentKey: '', prevKey: '', progress: 1 };

  private preloadAll() {
    if (this.preloaded) return;
    this.preloaded = true;
    const keys = new Set([
      ...Object.values(ANIMATION_IMAGES),
      ...Object.values(EMOTION_IMAGES),
    ]);
    for (const key of keys) {
      spriteCache.loadImage(`${BASE}${key}.png`);
    }
  }

  render(
    ctx: CanvasRenderingContext2D,
    emotion: PetEmotion,
    animation: AnimationName,
    deltaMs: number,
    canvasSize: number,
    _cursorPos?: CursorPos | null,
    facingLeft?: boolean
  ): void {
    this.preloadAll();
    this.animTime += deltaMs;
    const t = this.animTime;
    const s = canvasSize / 128;

    ctx.clearRect(0, 0, canvasSize, canvasSize);

    const imageKey = getImageKey(emotion, animation);

    if (imageKey !== this.crossfade.currentKey) {
      this.crossfade.prevKey = this.crossfade.currentKey;
      this.crossfade.currentKey = imageKey;
      if (this.crossfade.prevKey) this.crossfade.progress = 0;
    }

    if (this.crossfade.progress < 1) {
      this.crossfade.progress = Math.min(1, this.crossfade.progress + deltaMs / CROSSFADE_MS);
    }

    const isCrossfading = this.crossfade.progress < 1;

    let offsetX = 0;
    let offsetY = 0;
    let rotation = 0;
    let scaleX = 1;
    let scaleY = 1;

    if (!isCrossfading) {
      if (animation === "idle") {
        offsetY = Math.sin(t / 800) * 2 * s;
      } else if (animation === "walk") {
        const step = t / 250;
        offsetY = -Math.abs(Math.sin(step)) * 3 * s;
        rotation = Math.sin(step * 0.5) * 0.05;
        scaleY = 1 + Math.abs(Math.sin(step)) * 0.03;
      } else if (animation === "run") {
        const step = t / 150;
        offsetY = -Math.abs(Math.sin(step)) * 4 * s;
        rotation = Math.sin(step * 0.5) * 0.07;
        scaleY = 1 + Math.abs(Math.sin(step)) * 0.04;
      } else if (animation === "eat") {
        offsetY = Math.sin(t / 200) * 1.5 * s;
      } else if (animation === "sleep" || animation === "lie") {
        offsetY = Math.sin(t / 1200) * 1 * s;
      } else if (animation === "play") {
        offsetY = Math.sin(t / 200) * 4 * s;
        rotation = Math.sin(t / 300) * 0.04;
      } else if (animation === "drag") {
        offsetX = Math.sin(t / 90) * 5 * s;
        offsetY = Math.sin(t / 120) * 3 * s;
        scaleX = 1 + Math.sin(t / 150) * 0.03;
        scaleY = 1 - Math.sin(t / 150) * 0.03;
      } else if (animation === "angry") {
        offsetX = Math.sin(t / 70) * 3 * s;
      } else if (animation === "sit" || animation === "groom") {
        offsetY = Math.sin(t / 900) * 1 * s;
      } else if (animation === "yawn") {
        offsetY = Math.sin(t / 600) * 1.5 * s;
        scaleY = 1 + Math.sin(t / 500) * 0.02;
      } else {
        offsetY = Math.sin(t / 900) * 1 * s;
      }
    }

    const opts = { offsetX, offsetY, scaleX, scaleY, rotation, flip: facingLeft };

    if (isCrossfading && this.crossfade.prevKey) {
      const oldImg = spriteCache.getLoadedImage(`${BASE}${this.crossfade.prevKey}.png`);
      if (oldImg) {
        drawSprite(ctx, oldImg, canvasSize, { ...opts, opacity: 1 - this.crossfade.progress });
      }
    }

    const newImg = spriteCache.getLoadedImage(`${BASE}${imageKey}.png`);
    drawSprite(ctx, newImg, canvasSize, {
      ...opts,
      opacity: isCrossfading ? this.crossfade.progress : 1,
    });

    const isSleeping = animation === "sleep" || animation === "lie";
    if (isSleeping || emotion === "sleepy") drawZzz(ctx, canvasSize, t);
    if (emotion === "happy" && !isSleeping) drawSparkle(ctx, canvasSize, t);
    if (emotion === "sad") drawTear(ctx, canvasSize, t);
  }
}
