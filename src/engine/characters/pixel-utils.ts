// Pixel art shared utilities for desktop pet character renderers.
// All characters use 18x18 pixel grids scaled to fill the 128x128 canvas.

export type PixelSprite = (string | null)[][];

/**
 * Render a pixel sprite centered on the canvas.
 * Each non-null cell in the 2D array is drawn as a filled rectangle.
 */
export function renderPixelSprite(
  ctx: CanvasRenderingContext2D,
  sprite: PixelSprite,
  canvasSize: number,
  offsetX = 0,
  offsetY = 0,
  flip = false
): void {
  const spriteH = sprite.length;
  const spriteW = sprite[0]?.length ?? 0;
  if (spriteW === 0 || spriteH === 0) return;

  const pixelSize = Math.floor(canvasSize / Math.max(spriteW, spriteH));
  const startX = Math.floor((canvasSize - spriteW * pixelSize) / 2) + offsetX;
  const startY = Math.floor((canvasSize - spriteH * pixelSize) / 2) + offsetY;

  ctx.clearRect(0, 0, canvasSize, canvasSize);

  for (let row = 0; row < spriteH; row++) {
    for (let col = 0; col < spriteW; col++) {
      const color = sprite[row][col];
      if (color !== null) {
        const drawCol = flip ? spriteW - 1 - col : col;
        ctx.fillStyle = color;
        ctx.fillRect(
          startX + drawCol * pixelSize,
          startY + row * pixelSize,
          pixelSize,
          pixelSize
        );
      }
    }
  }
}

/**
 * Render a pixel sprite WITHOUT clearing — for compositing multiple sprites.
 */
export function blitPixelSprite(
  ctx: CanvasRenderingContext2D,
  sprite: PixelSprite,
  canvasSize: number,
  offsetX = 0,
  offsetY = 0,
  flip = false
): void {
  const spriteH = sprite.length;
  const spriteW = sprite[0]?.length ?? 0;
  if (spriteW === 0 || spriteH === 0) return;

  const pixelSize = Math.floor(canvasSize / Math.max(spriteW, spriteH));
  const startX = Math.floor((canvasSize - spriteW * pixelSize) / 2) + offsetX;
  const startY = Math.floor((canvasSize - spriteH * pixelSize) / 2) + offsetY;

  for (let row = 0; row < spriteH; row++) {
    for (let col = 0; col < spriteW; col++) {
      const color = sprite[row][col];
      if (color !== null) {
        const drawCol = flip ? spriteW - 1 - col : col;
        ctx.fillStyle = color;
        ctx.fillRect(
          startX + drawCol * pixelSize,
          startY + row * pixelSize,
          pixelSize,
          pixelSize
        );
      }
    }
  }
}

/**
 * Draw floating Zzz effect using pixel rectangles.
 * time is in milliseconds.
 */
export function renderZzz(
  ctx: CanvasRenderingContext2D,
  canvasSize: number,
  time: number
): void {
  const p = Math.floor(canvasSize / 18); // pixel size
  const cycle = (time / 1200) % 1;
  const baseX = Math.floor(canvasSize * 0.72);
  const baseY = Math.floor(canvasSize * 0.28);

  // Three z's at different vertical offsets, fading as they rise
  const zDefs = [
    { size: 3, x: baseX, y: baseY - Math.floor(cycle * 8 * p), alpha: 1 - cycle },
    { size: 2, x: baseX + 2 * p, y: baseY - Math.floor((cycle + 0.33) % 1 * 8 * p) - 4 * p, alpha: 1 - (cycle + 0.33) % 1 },
    { size: 2, x: baseX + p, y: baseY - Math.floor((cycle + 0.66) % 1 * 8 * p) - 8 * p, alpha: 1 - (cycle + 0.66) % 1 },
  ];

  for (const z of zDefs) {
    const a = Math.max(0, z.alpha);
    if (a < 0.05) continue;
    ctx.fillStyle = `rgba(147, 155, 240, ${a})`;
    drawPixelZ(ctx, z.x, z.y, z.size, p);
  }
}

function drawPixelZ(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  p: number
): void {
  // Z shape: top row, diagonal, bottom row
  const w = size + 1;
  // top row
  for (let i = 0; i < w; i++) ctx.fillRect(x + i * p, y, p, p);
  // diagonal (top-right to bottom-left)
  for (let i = 0; i < size; i++) ctx.fillRect(x + (size - i) * p, y + (i + 1) * p, p, p);
  // bottom row
  for (let i = 0; i < w; i++) ctx.fillRect(x + i * p, y + (size + 1) * p, p, p);
}

/**
 * Draw a sparkle / star effect using pixel dots.
 */
export function renderSparkle(
  ctx: CanvasRenderingContext2D,
  canvasSize: number,
  time: number
): void {
  const p = Math.floor(canvasSize / 18);
  const pulse = Math.abs(Math.sin(time / 400));

  // Four-pointed star pattern at two positions
  const stars = [
    { x: Math.floor(canvasSize * 0.78), y: Math.floor(canvasSize * 0.18), r: pulse },
    { x: Math.floor(canvasSize * 0.68), y: Math.floor(canvasSize * 0.12), r: pulse * 0.6 },
  ];

  for (const star of stars) {
    if (star.r < 0.1) continue;
    ctx.fillStyle = `rgba(251, 200, 50, ${star.r})`;
    // center
    ctx.fillRect(star.x, star.y, p, p);
    // arms
    ctx.fillRect(star.x - p, star.y, p, p);
    ctx.fillRect(star.x + p, star.y, p, p);
    ctx.fillRect(star.x, star.y - p, p, p);
    ctx.fillRect(star.x, star.y + p, p, p);
  }
}

/**
 * Draw a teardrop falling from side (-1=left, 1=right relative to sprite center).
 */
export function renderTear(
  ctx: CanvasRenderingContext2D,
  canvasSize: number,
  time: number,
  side: -1 | 1
): void {
  const p = Math.floor(canvasSize / 18);
  const progress = (time / 900) % 1;
  const cx = Math.floor(canvasSize / 2) + side * Math.floor(canvasSize * 0.08);
  const topY = Math.floor(canvasSize * 0.42);
  const y = topY + Math.floor(progress * 6 * p);
  const alpha = 1 - progress * 0.5;

  ctx.fillStyle = `rgba(120, 180, 255, ${alpha})`;
  ctx.fillRect(cx, y, p, p);
  ctx.fillRect(cx, y + p, p, p);
}

/**
 * Draw pixel-art shadow (row of semi-transparent pixels) below character.
 */
export function renderPixelShadow(
  ctx: CanvasRenderingContext2D,
  canvasSize: number,
  widthPixels: number,
  verticalOffsetRatio = 0.82
): void {
  const p = Math.floor(canvasSize / 18);
  const y = Math.floor(canvasSize * verticalOffsetRatio);
  const cx = Math.floor(canvasSize / 2);
  const halfW = Math.floor(widthPixels / 2);

  for (let i = -halfW; i <= halfW; i++) {
    const dist = Math.abs(i) / halfW;
    const alpha = (1 - dist * dist) * 0.2;
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.fillRect(cx + i * p, y, p, Math.ceil(p * 0.5));
  }
}
