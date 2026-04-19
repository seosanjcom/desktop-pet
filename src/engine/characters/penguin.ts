import type { PetEmotion, AnimationName } from "@/types/pet";
import type { CursorPos } from "@/engine/sprite-renderer";
import type { CharacterRenderer } from "./index";

const BODY_COLOR = "#4A5060";
const OUTLINE_COLOR = "#333A45";
const BELLY_COLOR = "#FFFFFF";
const EYE_COLOR = "#1A1510";
const BEAK_COLOR = "#F6AD55";
const FEET_COLOR = "#F6AD55";

function drawBody(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - h);
  ctx.bezierCurveTo(cx + w * 1.15, cy - h * 0.55, cx + w * 1.15, cy + h * 0.55, cx, cy + h);
  ctx.bezierCurveTo(cx - w * 1.15, cy + h * 0.55, cx - w * 1.15, cy - h * 0.55, cx, cy - h);
  ctx.closePath();
}

function drawEyes(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  emotion: PetEmotion,
  animation: AnimationName,
  t: number
) {
  const eyeY = cy - 6 * s;
  const eyeSpacing = 7 * s;

  if (emotion === "happy" || animation === "play") {
    ctx.strokeStyle = EYE_COLOR;
    ctx.lineWidth = 1.8 * s;
    ctx.lineCap = "round";
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(cx + side * eyeSpacing, eyeY + 1 * s, 3 * s, Math.PI + 0.3, -0.3);
      ctx.stroke();
    }
  } else if (emotion === "sad") {
    for (const side of [-1, 1]) {
      ctx.fillStyle = EYE_COLOR;
      ctx.beginPath();
      ctx.arc(cx + side * eyeSpacing, eyeY + 1 * s, 2 * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = EYE_COLOR;
    ctx.lineWidth = 1 * s;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + side * (eyeSpacing - 3 * s), eyeY - 4 * s);
      ctx.lineTo(cx + side * (eyeSpacing + 2 * s), eyeY - 3 * s);
      ctx.stroke();
    }
  } else if (emotion === "angry") {
    for (const side of [-1, 1]) {
      ctx.fillStyle = EYE_COLOR;
      ctx.beginPath();
      ctx.arc(cx + side * eyeSpacing, eyeY, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = EYE_COLOR;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(cx + side * (eyeSpacing - 4 * s), eyeY - 5 * s);
      ctx.lineTo(cx + side * (eyeSpacing + 2 * s), eyeY - 3 * s);
      ctx.stroke();
    }
  } else if (emotion === "sleepy" || animation === "sleep" || animation === "lie") {
    ctx.strokeStyle = EYE_COLOR;
    ctx.lineWidth = 1.5 * s;
    ctx.lineCap = "round";
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + side * eyeSpacing - 3 * s, eyeY);
      ctx.lineTo(cx + side * eyeSpacing + 3 * s, eyeY);
      ctx.stroke();
    }
  } else {
    const blink = t % 3500;
    const isBlinking = blink > 3300 && blink < 3450;
    if (isBlinking) {
      ctx.strokeStyle = EYE_COLOR;
      ctx.lineWidth = 1.5 * s;
      ctx.lineCap = "round";
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(cx + side * eyeSpacing - 2 * s, eyeY);
        ctx.lineTo(cx + side * eyeSpacing + 2 * s, eyeY);
        ctx.stroke();
      }
    } else {
      for (const side of [-1, 1]) {
        ctx.fillStyle = EYE_COLOR;
        ctx.beginPath();
        ctx.arc(cx + side * eyeSpacing, eyeY, 2.5 * s, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function drawZzz(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, t: number) {
  ctx.save();
  const alpha = 0.5 + Math.sin(t / 800) * 0.25;
  const zOff = ((t / 1500) % 1) * 12 * s;
  ctx.fillStyle = `rgba(140, 150, 255, ${alpha})`;
  ctx.font = `bold ${9 * s}px sans-serif`;
  ctx.fillText("z", cx + 22 * s, cy - 24 * s - zOff);
  ctx.font = `bold ${7 * s}px sans-serif`;
  ctx.fillText("z", cx + 28 * s, cy - 32 * s - zOff * 0.7);
  ctx.restore();
}

function drawSparkle(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, t: number) {
  const alpha = Math.abs(Math.sin(t / 400)) * 0.7;
  ctx.save();
  ctx.fillStyle = `rgba(255, 210, 80, ${alpha})`;
  ctx.font = `${7 * s}px sans-serif`;
  ctx.fillText("✦", cx + 22 * s, cy - 22 * s);
  ctx.font = `${5 * s}px sans-serif`;
  ctx.fillText("✦", cx + 30 * s, cy - 16 * s);
  ctx.restore();
}

function drawTear(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, t: number) {
  const progress = (t % 1000) / 1000;
  ctx.save();
  ctx.fillStyle = `rgba(120, 180, 255, ${0.6 - progress * 0.4})`;
  ctx.beginPath();
  ctx.ellipse(cx - 10 * s, cy - 4 * s + progress * 10 * s, 1.5 * s, 2.5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export class PenguinRenderer implements CharacterRenderer {
  private animTime = 0;

  render(
    ctx: CanvasRenderingContext2D,
    emotion: PetEmotion,
    animation: AnimationName,
    deltaMs: number,
    canvasSize: number,
    _cursorPos?: CursorPos | null,
    facingLeft?: boolean
  ): void {
    this.animTime += deltaMs;
    const t = this.animTime;
    const s = canvasSize / 128;

    ctx.clearRect(0, 0, canvasSize, canvasSize);

    const cx = canvasSize / 2;
    const cy = canvasSize / 2;
    const bodyW = 38 * s;
    const bodyH = 48 * s;

    let offsetX = 0;
    let offsetY = 0;
    let rotation = 0;
    let scaleY = 1;

    if (animation === "idle") {
      offsetY = Math.sin(t / 800) * 1.5 * s;
      offsetX = Math.sin(t / 1400) * 0.8 * s;
    } else if (animation === "walk") {
      offsetY = Math.sin(t / 350) * 2 * s;
      rotation = Math.sin(t / 420) * 0.06;
    } else if (animation === "run") {
      offsetY = Math.sin(t / 200) * 3 * s;
      rotation = Math.sin(t / 250) * 0.08;
    } else if (animation === "eat") {
      offsetY = 2 * s + Math.sin(t / 200) * 1 * s;
    } else if (animation === "sleep" || animation === "lie") {
      offsetY = 3 * s;
    } else if (animation === "play") {
      offsetY = Math.sin(t / 200) * 4 * s;
    } else if (animation === "drag") {
      offsetX = Math.sin(t / 90) * 4 * s;
      offsetY = Math.sin(t / 120) * 2 * s;
      scaleY = 0.92;
    } else if (animation === "angry") {
      offsetX = Math.sin(t / 70) * 3 * s;
    } else {
      offsetY = Math.sin(t / 900) * 1 * s;
    }

    ctx.save();
    ctx.translate(cx + offsetX, cy + offsetY);
    if (facingLeft) ctx.scale(-1, 1);
    ctx.rotate(rotation);
    ctx.scale(1, scaleY);

    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.beginPath();
    ctx.ellipse(0, bodyH + 4 * s, bodyW * 0.7, 3 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // body
    drawBody(ctx, 0, 0, bodyW, bodyH);
    ctx.fillStyle = BODY_COLOR;
    ctx.fill();
    ctx.strokeStyle = OUTLINE_COLOR;
    ctx.lineWidth = 1.8 * s;
    ctx.lineJoin = "round";
    ctx.stroke();

    // belly (large white oval — defining penguin feature)
    ctx.beginPath();
    ctx.ellipse(0, 6 * s, 24 * s, 32 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = BELLY_COLOR;
    ctx.fill();

    // blush (on white belly area)
    ctx.fillStyle = "rgba(255,176,192,0.4)";
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(side * 13 * s, -2 * s, 5 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // eyes (on belly area, so visible against white)
    drawEyes(ctx, 0, 0, s, emotion, animation, t);

    // beak (small orange triangle pointing down)
    ctx.fillStyle = BEAK_COLOR;
    ctx.beginPath();
    ctx.moveTo(-3 * s, -1 * s);
    ctx.lineTo(3 * s, -1 * s);
    ctx.lineTo(0, 4 * s);
    ctx.closePath();
    ctx.fill();

    // flippers (tiny dark nubs on sides)
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(side * bodyW * 0.9, 2 * s, 6 * s, 4 * s, side * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = BODY_COLOR;
      ctx.fill();
      ctx.strokeStyle = OUTLINE_COLOR;
      ctx.lineWidth = 1.2 * s;
      ctx.stroke();
    }

    // feet (small orange triangles)
    for (const side of [-1, 1]) {
      ctx.fillStyle = FEET_COLOR;
      ctx.beginPath();
      ctx.moveTo(side * 10 * s, bodyH);
      ctx.lineTo(side * 18 * s, bodyH + 6 * s);
      ctx.lineTo(side * 2 * s, bodyH + 6 * s);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();

    const isSleeping = animation === "sleep" || animation === "lie";
    if (isSleeping || emotion === "sleepy") drawZzz(ctx, cx, cy, s, t);
    if (emotion === "happy" && !isSleeping) drawSparkle(ctx, cx, cy, s, t);
    if (emotion === "sad") drawTear(ctx, cx, cy, s, t);
  }
}
