// image-sprite.ts — shared image loader and sprite processor for character renderers

export interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

class ImageSpriteCache {
  private images: Map<string, HTMLImageElement> = new Map();
  private sprites: Map<string, HTMLCanvasElement> = new Map();

  loadImage(src: string): HTMLImageElement | null {
    if (this.images.has(src)) return this.images.get(src)!;

    const img = new Image();
    img.src = src;
    this.images.set(src, img);
    return null; // not loaded yet on first call
  }

  getLoadedImage(src: string): HTMLImageElement | null {
    const img = this.images.get(src);
    if (!img) {
      this.loadImage(src);
      return null;
    }
    if (!img.complete || img.naturalWidth === 0) return null;
    return img;
  }

  getSprite(src: string, cropKey: string, crop: CropRect): HTMLCanvasElement | null {
    const key = `${src}::${cropKey}`;
    if (this.sprites.has(key)) return this.sprites.get(key)!;

    const img = this.getLoadedImage(src);
    if (!img) return null;

    const canvas = this.processSprite(img, crop);
    this.sprites.set(key, canvas);
    return canvas;
  }

  private processSprite(img: HTMLImageElement, crop: CropRect): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = crop.w;
    canvas.height = crop.h;
    const ctx = canvas.getContext("2d")!;

    ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);

    const imageData = ctx.getImageData(0, 0, crop.w, crop.h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r > 230 && g > 230 && b > 230) {
        data[i + 3] = 0;
      } else if (r > 210 && g > 210 && b > 210) {
        data[i + 3] = Math.floor(data[i + 3] * 0.3);
      }
    }
    ctx.putImageData(imageData, 0, 0);

    return canvas;
  }
}

export const spriteCache = new ImageSpriteCache();

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: HTMLCanvasElement | HTMLImageElement | null,
  canvasSize: number,
  options?: {
    offsetX?: number;
    offsetY?: number;
    scaleX?: number;
    scaleY?: number;
    rotation?: number;
    flip?: boolean;
    opacity?: number;
  }
): void {
  if (!sprite) return;

  const {
    offsetX = 0,
    offsetY = 0,
    scaleX = 1,
    scaleY = 1,
    rotation = 0,
    flip = false,
    opacity = 1,
  } = options ?? {};

  const imgW = sprite instanceof HTMLImageElement ? sprite.naturalWidth : sprite.width;
  const imgH = sprite instanceof HTMLImageElement ? sprite.naturalHeight : sprite.height;
  if (imgW === 0 || imgH === 0) return;

  const maxSize = canvasSize * 0.85;
  const ratio = Math.min(maxSize / imgW, maxSize / imgH);
  const drawW = imgW * ratio;
  const drawH = imgH * ratio;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(canvasSize / 2 + offsetX, canvasSize / 2 + offsetY);
  if (rotation) ctx.rotate(rotation);
  ctx.scale(flip ? -scaleX : scaleX, scaleY);
  ctx.drawImage(sprite, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
}

export function drawZzz(
  ctx: CanvasRenderingContext2D,
  canvasSize: number,
  t: number
): void {
  const s = canvasSize / 128;
  ctx.save();
  ctx.fillStyle = "rgba(130, 140, 248, 0.6)";
  ctx.font = `bold ${Math.round(10 * s)}px sans-serif`;
  ctx.textAlign = "left";
  const zOff = ((t / 1500) % 1) * 15 * s;
  ctx.fillText("z", canvasSize * 0.72, canvasSize * 0.25 - zOff);
  ctx.font = `bold ${Math.round(8 * s)}px sans-serif`;
  ctx.fillText("z", canvasSize * 0.78, canvasSize * 0.18 - zOff * 0.7);
  ctx.restore();
}

export function drawSparkle(
  ctx: CanvasRenderingContext2D,
  canvasSize: number,
  t: number
): void {
  const s = canvasSize / 128;
  const alpha = Math.abs(Math.sin(t / 350));
  ctx.save();
  ctx.fillStyle = `rgba(255, 200, 50, ${alpha * 0.8})`;
  ctx.font = `${Math.round(8 * s)}px sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText("✦", canvasSize * 0.75, canvasSize * 0.2);
  ctx.fillText("✦", canvasSize * 0.82, canvasSize * 0.3);
  ctx.restore();
}

export function drawTear(
  ctx: CanvasRenderingContext2D,
  canvasSize: number,
  t: number
): void {
  const s = canvasSize / 128;
  const progress = (t % 1000) / 1000;
  ctx.save();
  ctx.fillStyle = `rgba(100, 170, 255, ${0.7 - progress * 0.5})`;
  ctx.beginPath();
  ctx.ellipse(
    canvasSize * 0.35,
    canvasSize * 0.45 + progress * 12 * s,
    2 * s,
    3 * s,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();
}
