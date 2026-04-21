import type { PetEmotion, AnimationName, CharacterType } from "@/types/pet";
import { OrangutanRenderer, CatRenderer, HamsterRenderer } from "./characters";
import type { CharacterRenderer } from "./characters";

export interface CursorPos {
  x: number;
  y: number;
}

const renderers: Record<CharacterType, CharacterRenderer> = {
  orangutan: new OrangutanRenderer(),
  cat: new CatRenderer(),
  hamster: new HamsterRenderer(),
};

// Legacy state for backward compat (cat renderer used this)
interface RendererState {
  walkOffset: number;
  walkDirection: 1 | -1;
  animationTime: number;
  tailAngle: number;
  earTwitchTime: number;
  legPhase: number;
}

const state: RendererState = {
  walkOffset: 0,
  walkDirection: 1,
  animationTime: 0,
  tailAngle: 0,
  earTwitchTime: 0,
  legPhase: 0,
};

export function renderPet(
  ctx: CanvasRenderingContext2D,
  emotion: PetEmotion,
  animation: AnimationName,
  deltaMs: number,
  canvasSize: number,
  cursorPos?: CursorPos | null,
  facingLeft?: boolean,
  characterType?: CharacterType
): void {
  if (characterType && renderers[characterType]) {
    renderers[characterType].render(ctx, emotion, animation, deltaMs, canvasSize, cursorPos, facingLeft);
    return;
  }

  // Fallback to legacy cat renderer
  state.animationTime += deltaMs;
  state.legPhase = (state.legPhase + deltaMs * 0.008) % (Math.PI * 2);

  ctx.clearRect(0, 0, canvasSize, canvasSize);

  const cx = canvasSize / 2;
  const baseY = canvasSize * 0.58;
  const scale = canvasSize / 128;

  let offsetX = 0;
  let offsetY = 0;

  // 방향 플립 (facingLeft)
  const flip = facingLeft === true;

  // 애니메이션별 오프셋 계산
  if (animation === "idle") {
    offsetY = Math.sin(state.animationTime / 500) * 1.5 * scale;
    state.tailAngle = Math.sin(state.animationTime / 600) * 0.4;
  } else if (animation === "walk") {
    offsetY = Math.sin(state.animationTime / 220) * 2 * scale;
    state.tailAngle = Math.sin(state.animationTime / 300) * 0.6;
  } else if (animation === "run") {
    offsetY = Math.sin(state.animationTime / 120) * 3 * scale;
    state.tailAngle = Math.sin(state.animationTime / 150) * 0.8;
  } else if (animation === "play") {
    offsetY = Math.sin(state.animationTime / 200) * 3 * scale;
    state.tailAngle = Math.sin(state.animationTime / 300) * 0.6;
  } else if (animation === "eat") {
    offsetY = Math.sin(state.animationTime / 300) * 3 * scale + 2 * scale;
    state.tailAngle = Math.sin(state.animationTime / 700) * 0.3;
  } else if (animation === "sleep" || animation === "lie") {
    offsetY = 2 * scale;
    state.tailAngle = Math.sin(state.animationTime / 1200) * 0.15;
  } else if (animation === "angry") {
    offsetX = Math.sin(state.animationTime / 70) * 3 * scale;
    state.tailAngle = Math.sin(state.animationTime / 100) * 0.9;
  } else if (animation === "sit" || animation === "groom" || animation === "yawn") {
    offsetY = 1 * scale;
    state.tailAngle = Math.sin(state.animationTime / 800) * 0.3;
  } else if (animation === "drag") {
    // 발버둥 — 좌우로 흔들림
    offsetX = Math.sin(state.animationTime / 80) * 4 * scale;
    offsetY = Math.sin(state.animationTime / 110) * 3 * scale;
    state.tailAngle = Math.sin(state.animationTime / 100) * 1.0;
  }

  const x = cx + offsetX;
  const y = baseY + offsetY;

  // 방향 플립 적용
  if (flip) {
    ctx.save();
    ctx.translate(canvasSize, 0);
    ctx.scale(-1, 1);
  }

  // 그림자
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.beginPath();
  const shadowW = 28 * scale;
  const shadowH = 6 * scale;
  ctx.ellipse(x, y + 24 * scale, shadowW, shadowH, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 꼬리 먼저 그리기 (몸통 뒤)
  drawTail(ctx, x, y, scale, emotion, state.tailAngle, animation);

  // 앞발 (뒤 레이어)
  drawLegs(ctx, x, y, scale, animation, state.animationTime);

  // 몸통
  drawBody(ctx, x, y, scale, emotion);

  // 귀
  drawEars(ctx, x, y, scale, emotion, state.animationTime, animation);

  // 눈 (cursorPos를 canvas 좌표로 변환하여 전달)
  // cursorPos는 캔버스 div 기준 상대 좌표
  const eyeCursorX = cursorPos ? cursorPos.x - (flip ? canvasSize - x : x) : null;
  const eyeCursorY = cursorPos ? cursorPos.y - y : null;
  drawEyes(ctx, x, y, scale, emotion, state.animationTime, animation, eyeCursorX, eyeCursorY);

  // 코
  drawNose(ctx, x, y, scale);

  // 입
  drawMouth(ctx, x, y, scale, emotion);

  // 볼터치
  drawCheeks(ctx, x, y, scale, emotion);

  // 수염
  drawWhiskers(ctx, x, y, scale, emotion);

  // 눕기 특수: 몸 회전 표시 (몸통 위에 표시)
  if (animation === "lie") {
    drawLieEffect(ctx, x, y, scale, state.animationTime);
  }

  // 앉기 특수
  if (animation === "sit") {
    drawSitPaws(ctx, x, y, scale);
  }

  // 그루밍
  if (animation === "groom") {
    drawGroomEffect(ctx, x, y, scale, state.animationTime);
  }

  // 하품
  if (animation === "yawn") {
    drawYawnEffect(ctx, x, y, scale, state.animationTime);
  }

  // 수면 ZZZ
  if (animation === "sleep" || animation === "lie" || emotion === "sleepy") {
    drawSleepZzz(ctx, x, y, scale, state.animationTime);
  }

  // happy 반짝임
  if (emotion === "happy") {
    drawSparkle(ctx, x, y, scale, state.animationTime);
  }

  // sad 눈물
  if (emotion === "sad") {
    drawTear(ctx, x, y, scale, state.animationTime);
  }

  if (flip) {
    ctx.restore();
  }
}

// ─── 몸통 (납작한 타원형, 주황색 태비) ───────────────────────────────
function drawBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  emotion: PetEmotion
): void {
  const bodyW = 26 * scale;
  const bodyH = 22 * scale;

  // 주황 몸통
  ctx.save();
  ctx.fillStyle = "#f97316";
  ctx.strokeStyle = "#ea580c";
  ctx.lineWidth = 0.8 * scale;
  ctx.beginPath();
  ctx.ellipse(x, y, bodyW, bodyH, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 배 (흰색 타원)
  ctx.save();
  ctx.fillStyle = "#fff7ed";
  ctx.beginPath();
  ctx.ellipse(x, y + 4 * scale, bodyW * 0.55, bodyH * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 화날 때 털 부풀기 효과 (외곽선 울퉁불퉁)
  if (emotion === "angry") {
    ctx.save();
    ctx.strokeStyle = "#ea580c";
    ctx.lineWidth = 1 * scale;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const r1 = bodyW * 1.1;
      const r2 = bodyH * 1.1;
      const bx = x + Math.cos(angle) * r1;
      const by = y + Math.sin(angle) * r2;
      ctx.beginPath();
      ctx.moveTo(
        x + Math.cos(angle) * bodyW,
        y + Math.sin(angle) * bodyH
      );
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// ─── 귀 ──────────────────────────────────────────────────────────────
function drawEars(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  emotion: PetEmotion,
  time: number,
  animation: AnimationName
): void {
  const earHeight = emotion === "sad" ? 10 * scale : 14 * scale;
  const earWidth = 10 * scale;

  // 귀 가끔 까딱
  const earTwitch = animation === "idle"
    ? Math.floor(time / 2000) % 3 === 0 ? Math.sin(time / 100) * 0.15 : 0
    : 0;

  // 왼쪽 귀
  const lEarX = x - 14 * scale;
  const lEarBaseY = y - 18 * scale;

  ctx.save();
  ctx.translate(lEarX, lEarBaseY);
  ctx.rotate(-0.15 + earTwitch + (emotion === "sad" ? 0.3 : 0));
  ctx.fillStyle = "#f97316";
  ctx.strokeStyle = "#ea580c";
  ctx.lineWidth = 0.8 * scale;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-earWidth * 0.5, -earHeight);
  ctx.lineTo(earWidth * 0.5, -earHeight);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // 귀 안쪽 분홍
  ctx.fillStyle = "#fda4af";
  ctx.beginPath();
  ctx.moveTo(0, -2 * scale);
  ctx.lineTo(-earWidth * 0.28, -earHeight * 0.75);
  ctx.lineTo(earWidth * 0.28, -earHeight * 0.75);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 오른쪽 귀
  const rEarX = x + 14 * scale;

  ctx.save();
  ctx.translate(rEarX, lEarBaseY);
  ctx.rotate(0.15 - earTwitch - (emotion === "sad" ? 0.3 : 0));
  ctx.fillStyle = "#f97316";
  ctx.strokeStyle = "#ea580c";
  ctx.lineWidth = 0.8 * scale;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-earWidth * 0.5, -earHeight);
  ctx.lineTo(earWidth * 0.5, -earHeight);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#fda4af";
  ctx.beginPath();
  ctx.moveTo(0, -2 * scale);
  ctx.lineTo(-earWidth * 0.28, -earHeight * 0.75);
  ctx.lineTo(earWidth * 0.28, -earHeight * 0.75);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ─── 눈 ──────────────────────────────────────────────────────────────
function drawEyes(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  emotion: PetEmotion,
  time: number,
  animation: AnimationName,
  cursorDx?: number | null,
  cursorDy?: number | null
): void {
  const eyeY = y - 6 * scale;
  const eyeSpacingX = 9 * scale;

  // 커서 방향으로 눈동자 오프셋 계산
  let pupilDx = 0;
  let pupilDy = 0;
  if (cursorDx != null && cursorDy != null) {
    const dist = Math.sqrt(cursorDx * cursorDx + cursorDy * cursorDy);
    if (dist > 0) {
      const maxOffset = 1.5 * scale;
      pupilDx = (cursorDx / dist) * Math.min(maxOffset, dist * 0.05 * scale);
      pupilDy = (cursorDy / dist) * Math.min(maxOffset, dist * 0.05 * scale);
    }
  }

  // 깜빡임 (3초에 한 번)
  const blinkCycle = time % 3000;
  const isBlinking = blinkCycle > 2800 && blinkCycle < 2950;

  for (const side of [-1, 1] as const) {
    const ex = x + side * eyeSpacingX;

    if (emotion === "sleepy" || animation === "sleep") {
      // 반만 뜬 눈
      ctx.save();
      ctx.fillStyle = "#1c1917";
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, 4 * scale, 2 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      // 위쪽 반 가리기 (흰색으로 덮어서 반감은 효과)
      ctx.fillStyle = "#fff7ed";
      ctx.fillRect(ex - 5 * scale, eyeY - 4 * scale, 10 * scale, 4 * scale);
      ctx.restore();

    } else if (emotion === "happy") {
      // 눈 웃음 (^_^ 초승달)
      ctx.save();
      ctx.strokeStyle = "#1c1917";
      ctx.lineWidth = 1.8 * scale;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(ex, eyeY + 2 * scale, 4 * scale, Math.PI + 0.2, -0.2);
      ctx.stroke();
      ctx.restore();

    } else if (emotion === "angry") {
      // 찡그린 눈
      ctx.save();
      // 눈 자체
      ctx.fillStyle = "#1c1917";
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, 4 * scale, isBlinking ? 0.5 * scale : 3 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      // 하이라이트
      if (!isBlinking) {
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.beginPath();
        ctx.arc(ex - 1.5 * scale, eyeY - 1.5 * scale, 1.2 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      // 눈썹 (찡그림)
      ctx.strokeStyle = "#1c1917";
      ctx.lineWidth = 1.5 * scale;
      ctx.lineCap = "round";
      ctx.beginPath();
      const browY = eyeY - 5 * scale;
      if (side === -1) {
        ctx.moveTo(ex - 4 * scale, browY - 2 * scale);
        ctx.lineTo(ex + 2 * scale, browY + 1.5 * scale);
      } else {
        ctx.moveTo(ex - 2 * scale, browY + 1.5 * scale);
        ctx.lineTo(ex + 4 * scale, browY - 2 * scale);
      }
      ctx.stroke();
      ctx.restore();

    } else {
      // 기본 동그란 큰 눈
      ctx.save();
      // 흰자
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, 5 * scale, isBlinking ? 0.5 * scale : 5 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      if (!isBlinking) {
        // 동공 (커서 방향 오프셋 적용)
        ctx.fillStyle = "#1c1917";
        ctx.beginPath();
        ctx.ellipse(ex + 0.5 * scale + pupilDx, eyeY + 0.5 * scale + pupilDy, 3 * scale, 3.5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        // 하이라이트 (반짝임)
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.beginPath();
        ctx.arc(ex - 1 * scale + pupilDx, eyeY - 1.5 * scale + pupilDy, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ex + 2 * scale + pupilDx, eyeY + 1 * scale + pupilDy, 0.8 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}

// ─── 코 (세모 분홍) ──────────────────────────────────────────────────
function drawNose(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number
): void {
  ctx.save();
  ctx.fillStyle = "#f472b6";
  ctx.beginPath();
  ctx.moveTo(x, y + 2 * scale);
  ctx.lineTo(x - 2.5 * scale, y - 1 * scale);
  ctx.lineTo(x + 2.5 * scale, y - 1 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ─── 입 (w 모양 고양이 입) ───────────────────────────────────────────
function drawMouth(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  emotion: PetEmotion
): void {
  ctx.save();
  ctx.strokeStyle = "#9a3412";
  ctx.lineWidth = 1.2 * scale;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const mouthY = y + 5 * scale;

  if (emotion === "happy") {
    // 크게 웃는 입 (w형 + 위로 커브)
    ctx.beginPath();
    ctx.moveTo(x - 6 * scale, mouthY - 1 * scale);
    ctx.quadraticCurveTo(x - 3 * scale, mouthY + 4 * scale, x, mouthY + 1 * scale);
    ctx.quadraticCurveTo(x + 3 * scale, mouthY + 4 * scale, x + 6 * scale, mouthY - 1 * scale);
    ctx.stroke();

  } else if (emotion === "sad") {
    // 처진 입
    ctx.beginPath();
    ctx.moveTo(x - 5 * scale, mouthY + 2 * scale);
    ctx.quadraticCurveTo(x, mouthY - 2 * scale, x + 5 * scale, mouthY + 2 * scale);
    ctx.stroke();

  } else if (emotion === "angry") {
    // 날카로운 w
    ctx.beginPath();
    ctx.moveTo(x - 5 * scale, mouthY + 1 * scale);
    ctx.lineTo(x - 2 * scale, mouthY + 3 * scale);
    ctx.lineTo(x, mouthY);
    ctx.lineTo(x + 2 * scale, mouthY + 3 * scale);
    ctx.lineTo(x + 5 * scale, mouthY + 1 * scale);
    ctx.stroke();

  } else if (emotion === "sleepy") {
    // 작게 벌린 동그란 입
    ctx.beginPath();
    ctx.arc(x, mouthY, 2.5 * scale, 0, Math.PI);
    ctx.stroke();

  } else {
    // neutral: w 모양 기본
    ctx.beginPath();
    ctx.moveTo(x - 5 * scale, mouthY);
    ctx.quadraticCurveTo(x - 2.5 * scale, mouthY + 3 * scale, x, mouthY + 1 * scale);
    ctx.quadraticCurveTo(x + 2.5 * scale, mouthY + 3 * scale, x + 5 * scale, mouthY);
    ctx.stroke();
  }

  ctx.restore();
}

// ─── 볼터치 ──────────────────────────────────────────────────────────
function drawCheeks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  emotion: PetEmotion
): void {
  const opacity = emotion === "happy" ? 0.5 : 0.28;
  const cheekY = y + 1 * scale;
  const cheekR = emotion === "happy" ? 5 * scale : 4 * scale;

  ctx.save();
  ctx.fillStyle = `rgba(251, 113, 133, ${opacity})`;
  // 왼쪽
  ctx.beginPath();
  ctx.ellipse(x - 12 * scale, cheekY, cheekR, cheekR * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  // 오른쪽
  ctx.beginPath();
  ctx.ellipse(x + 12 * scale, cheekY, cheekR, cheekR * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ─── 수염 ─────────────────────────────────────────────────────────────
function drawWhiskers(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  emotion: PetEmotion
): void {
  ctx.save();
  ctx.strokeStyle = "rgba(120, 53, 15, 0.4)";
  ctx.lineWidth = 0.8 * scale;
  ctx.lineCap = "round";

  const wy = y + 1 * scale;
  const angry = emotion === "angry";

  // 왼쪽 수염 (3개)
  for (let i = 0; i < 3; i++) {
    const startY = wy + (i - 1) * 3 * scale;
    const angle = angry ? (i - 1) * 0.3 + 0.1 : (i - 1) * 0.15;
    ctx.beginPath();
    ctx.moveTo(x - 8 * scale, startY);
    ctx.lineTo(
      x - 8 * scale - Math.cos(angle) * 10 * scale,
      startY - Math.sin(angle) * 10 * scale
    );
    ctx.stroke();
  }

  // 오른쪽 수염 (3개)
  for (let i = 0; i < 3; i++) {
    const startY = wy + (i - 1) * 3 * scale;
    const angle = angry ? -(i - 1) * 0.3 - 0.1 : -(i - 1) * 0.15;
    ctx.beginPath();
    ctx.moveTo(x + 8 * scale, startY);
    ctx.lineTo(
      x + 8 * scale + Math.cos(angle) * 10 * scale,
      startY - Math.sin(angle) * 10 * scale
    );
    ctx.stroke();
  }

  ctx.restore();
}

// ─── 꼬리 ─────────────────────────────────────────────────────────────
function drawTail(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  emotion: PetEmotion,
  tailAngle: number,
  animation: AnimationName
): void {
  ctx.save();
  ctx.strokeStyle = "#f97316";
  ctx.lineWidth = 5 * scale;
  ctx.lineCap = "round";

  const tailBaseX = x + 20 * scale;
  const tailBaseY = y + 10 * scale;

  // 화났을 때 꼬리 부풀기
  if (emotion === "angry") {
    ctx.lineWidth = 8 * scale;
    ctx.strokeStyle = "#f97316";
  }

  // 꼬리 곡선
  const ctrl1X = tailBaseX + 15 * scale;
  const ctrl1Y = tailBaseY - 20 * scale * Math.cos(tailAngle);
  const endX = tailBaseX + 10 * scale * Math.cos(tailAngle + 0.5);
  const endY = tailBaseY - 30 * scale - 10 * scale * Math.sin(tailAngle);

  ctx.beginPath();
  ctx.moveTo(tailBaseX, tailBaseY);
  ctx.quadraticCurveTo(ctrl1X, ctrl1Y, endX, endY);
  ctx.stroke();

  // 꼬리 끝 (약간 밝은)
  ctx.strokeStyle = "#fb923c";
  ctx.lineWidth = 3 * scale;
  ctx.beginPath();
  ctx.moveTo(ctrl1X, ctrl1Y);
  ctx.quadraticCurveTo(
    (ctrl1X + endX) / 2,
    (ctrl1Y + endY) / 2,
    endX,
    endY
  );
  ctx.stroke();

  ctx.restore();
}

// ─── 앞발 ─────────────────────────────────────────────────────────────
function drawLegs(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  animation: AnimationName,
  time: number
): void {
  ctx.save();

  const legBaseY = y + 18 * scale;
  const legW = 7 * scale;
  const legH = 8 * scale;

  let leftLegOffsetY = 0;
  let rightLegOffsetY = 0;

  if (animation === "walk") {
    leftLegOffsetY = Math.sin(time / 180) * 3 * scale;
    rightLegOffsetY = Math.sin(time / 180 + Math.PI) * 3 * scale;
  } else if (animation === "play") {
    // 앞발로 장난치기 - 위아래
    leftLegOffsetY = Math.sin(time / 150) * 5 * scale;
    rightLegOffsetY = Math.sin(time / 150 + 1) * 5 * scale;
  } else if (animation === "eat") {
    // 고개 숙이기 시 발 앞으로
    leftLegOffsetY = 2 * scale;
    rightLegOffsetY = 2 * scale;
  }

  // 왼쪽 발
  ctx.fillStyle = "#f97316";
  ctx.strokeStyle = "#ea580c";
  ctx.lineWidth = 0.6 * scale;
  ctx.beginPath();
  ctx.ellipse(x - 13 * scale, legBaseY + leftLegOffsetY, legW * 0.55, legH * 0.5, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 오른쪽 발
  ctx.beginPath();
  ctx.ellipse(x + 13 * scale, legBaseY + rightLegOffsetY, legW * 0.55, legH * 0.5, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// ─── 수면 ZZZ ────────────────────────────────────────────────────────
function drawSleepZzz(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number
): void {
  ctx.save();
  const baseAlpha = 0.55 + Math.sin(time / 800) * 0.25;

  const zOffset = ((time / 1500) % 1) * 10 * scale;

  ctx.fillStyle = `rgba(129, 140, 248, ${baseAlpha})`;
  ctx.font = `bold ${9 * scale}px sans-serif`;
  ctx.fillText("z", x + 18 * scale, y - 20 * scale - zOffset);

  ctx.font = `bold ${7 * scale}px sans-serif`;
  ctx.fillText("z", x + 24 * scale, y - 28 * scale - zOffset * 0.7);

  ctx.font = `bold ${5 * scale}px sans-serif`;
  ctx.fillText("z", x + 28 * scale, y - 34 * scale - zOffset * 0.4);

  ctx.restore();
}

// ─── 반짝임 ──────────────────────────────────────────────────────────
function drawSparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number
): void {
  const sparkle = Math.abs(Math.sin(time / 350));
  ctx.save();
  ctx.fillStyle = `rgba(251, 191, 36, ${sparkle * 0.85})`;
  const sx = x + 22 * scale;
  const sy = y - 22 * scale;
  drawStar(ctx, sx, sy, 4, 4 * scale, 2 * scale);
  ctx.fill();

  ctx.fillStyle = `rgba(251, 191, 36, ${sparkle * 0.5})`;
  drawStar(ctx, sx - 10 * scale, sy - 5 * scale, 4, 2.5 * scale, 1.2 * scale);
  ctx.fill();
  ctx.restore();
}

// ─── 눈물 ─────────────────────────────────────────────────────────────
function drawTear(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number
): void {
  ctx.save();
  ctx.fillStyle = "rgba(96, 165, 250, 0.7)";

  const tearProgress = (time % 1200) / 1200;
  const tearY = y - 2 * scale + tearProgress * 10 * scale;

  // 왼쪽 눈물
  ctx.beginPath();
  ctx.ellipse(x - 10 * scale, tearY, 1.5 * scale, 2 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ─── 눕기 효과 (배 보이고 눕기) ──────────────────────────────────────
function drawLieEffect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number
): void {
  // 작은 하트 떠오르기
  const alpha = Math.abs(Math.sin(time / 1000)) * 0.6;
  ctx.save();
  ctx.fillStyle = `rgba(251, 113, 133, ${alpha})`;
  ctx.font = `${8 * scale}px sans-serif`;
  ctx.fillText("♡", x + 20 * scale, y - 25 * scale);
  ctx.restore();
}

// ─── 앉기 앞발 ──────────────────────────────────────────────────────
function drawSitPaws(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number
): void {
  // 앉을 때 앞발을 앞으로 모아 놓음 (기본 다리 위에 덮어 그림)
  ctx.save();
  ctx.fillStyle = "#f97316";
  ctx.strokeStyle = "#ea580c";
  ctx.lineWidth = 0.6 * scale;
  // 왼쪽 앞발
  ctx.beginPath();
  ctx.ellipse(x - 8 * scale, y + 22 * scale, 6 * scale, 4 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // 오른쪽 앞발
  ctx.beginPath();
  ctx.ellipse(x + 8 * scale, y + 22 * scale, 6 * scale, 4 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// ─── 그루밍 효과 (앞발로 세수) ──────────────────────────────────────
function drawGroomEffect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number
): void {
  // 앞발이 얼굴로 올라오는 동작 표현
  const phase = Math.sin(time / 300);
  const paw1Y = y - 8 * scale + phase * 4 * scale;
  ctx.save();
  ctx.fillStyle = "#f97316";
  ctx.strokeStyle = "#ea580c";
  ctx.lineWidth = 0.6 * scale;
  ctx.beginPath();
  ctx.ellipse(x - 10 * scale, paw1Y, 5 * scale, 3.5 * scale, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// ─── 하품 효과 ───────────────────────────────────────────────────────
function drawYawnEffect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number
): void {
  // 입을 크게 벌린 원
  const phase = (time % 1500) / 1500;
  const mouthOpen = Math.sin(phase * Math.PI) * 5 * scale;
  if (mouthOpen > 1) {
    ctx.save();
    ctx.fillStyle = "#9a3412";
    ctx.beginPath();
    ctx.ellipse(x, y + 5 * scale, 4 * scale, mouthOpen, 0, 0, Math.PI);
    ctx.fill();
    ctx.restore();
  }
}

// ─── 별 그리기 ────────────────────────────────────────────────────────
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerR: number,
  innerR: number
): void {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerR);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerR);
  ctx.closePath();
}
