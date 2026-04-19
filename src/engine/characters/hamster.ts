import type { PetEmotion, AnimationName } from "@/types/pet";
import type { CursorPos } from "@/engine/sprite-renderer";
import type { CharacterRenderer } from "./index";

const BODY_COLOR = "#F0D5B0";
const OUTLINE_COLOR = "#C4A67A";
const BELLY_COLOR = "#FFFAF0";
const EYE_COLOR = "#2D2017";
const NOSE_COLOR = "#F4899E";
const EAR_INNER = "#F9B4C6";

// Hamster body is wider at cheek level — puffy cheek shape
function drawHamsterBody(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - h);
  // wide at cheek level (upper portion)
  ctx.bezierCurveTo(cx + w * 1.35, cy - h * 0.45, cx + w * 1.35, cy + h * 0.15, cx, cy + h);
  ctx.bezierCurveTo(cx - w * 1.35, cy + h * 0.15, cx - w * 1.35, cy - h * 0.45, cx, cy - h);
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
  const eyeY = cy - 10 * s;
  const eyeSpacing = 8 * s;

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

export class HamsterRenderer implements CharacterRenderer {
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
    const bodyH = 42 * s;

    let offsetX = 0;
    let offsetY = 0;
    let rotation = 0;
    let scaleY = 1;

    if (animation === "idle") {
      offsetY = Math.sin(t / 800) * 1.5 * s;
    } else if (animation === "walk") {
      offsetY = Math.sin(t / 300) * 2 * s;
      rotation = Math.sin(t / 400) * 0.04;
    } else if (animation === "run") {
      offsetY = Math.sin(t / 180) * 3 * s;
      rotation = Math.sin(t / 250) * 0.06;
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
    ctx.ellipse(0, bodyH + 4 * s, bodyW * 0.75, 3 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // ears (semicircles on top)
    for (const side of [-1, 1]) {
      // outer ear
      ctx.beginPath();
      ctx.arc(side * 18 * s, -bodyH + 2 * s, 8 * s, Math.PI, 0);
      ctx.closePath();
      ctx.fillStyle = BODY_COLOR;
      ctx.fill();
      ctx.strokeStyle = OUTLINE_COLOR;
      ctx.lineWidth = 1.5 * s;
      ctx.stroke();

      // inner ear
      ctx.beginPath();
      ctx.arc(side * 18 * s, -bodyH + 2 * s, 5 * s, Math.PI, 0);
      ctx.closePath();
      ctx.fillStyle = EAR_INNER;
      ctx.fill();
    }

    // body (wider at top = puffy cheeks)
    drawHamsterBody(ctx, 0, 0, bodyW, bodyH);
    ctx.fillStyle = BODY_COLOR;
    ctx.fill();
    ctx.strokeStyle = OUTLINE_COLOR;
    ctx.lineWidth = 1.8 * s;
    ctx.lineJoin = "round";
    ctx.stroke();

    // belly
    ctx.beginPath();
    ctx.ellipse(0, 6 * s, 20 * s, 25 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = BELLY_COLOR;
    ctx.fill();

    // blush (on puffy cheeks, slightly larger)
    ctx.fillStyle = "rgba(255,176,192,0.42)";
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(side * 22 * s, -6 * s, 7 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // eyes
    drawEyes(ctx, 0, 0, s, emotion, animation, t);

    // nose (tiny pink dot)
    ctx.fillStyle = NOSE_COLOR;
    ctx.beginPath();
    ctx.arc(0, -3 * s, 1.5 * s, 0, Math.PI * 2);
    ctx.fill();

    // mouth (tiny Y shape)
    ctx.strokeStyle = OUTLINE_COLOR;
    ctx.lineWidth = 1 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, -1 * s);
    ctx.lineTo(0, 2 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 2 * s);
    ctx.lineTo(-3 * s, 4.5 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 2 * s);
    ctx.lineTo(3 * s, 4.5 * s);
    ctx.stroke();

    // tiny paw bumps
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(side * bodyW * 0.82, 16 * s, 4 * s, 3 * s, 0, 0, Math.PI * 2);
      ctx.fillStyle = BODY_COLOR;
      ctx.fill();
    }

    // feet
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(side * 12 * s, bodyH + 2 * s, 6 * s, 3.5 * s, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#C4A67A";
      ctx.fill();
    }

    ctx.restore();

    const isSleeping = animation === "sleep" || animation === "lie";
    if (isSleeping || emotion === "sleepy") drawZzz(ctx, cx, cy, s, t);
    if (emotion === "happy" && !isSleeping) drawSparkle(ctx, cx, cy, s, t);
    if (emotion === "sad") drawTear(ctx, cx, cy, s, t);
  }
}
