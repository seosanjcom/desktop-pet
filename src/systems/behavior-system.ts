import type { PetStats, PetEmotion, Behavior, BehaviorType, AnimationName } from "@/types/pet";

interface BehaviorWeights {
  walk: number;
  idle: number;
  sit: number;
  groom: number;
  yawn: number;
  lie: number;
  play: number;
  run: number;
}

const BASE_WEIGHTS: BehaviorWeights = {
  walk: 30,
  idle: 20,
  sit: 15,
  groom: 10,
  yawn: 8,
  lie: 5,
  play: 7,
  run: 5,
};

const DURATION_RANGES: Record<BehaviorType, [number, number]> = {
  walk: [2000, 5000],
  idle: [1000, 3000],
  sit: [3000, 8000],
  groom: [2000, 3000],
  yawn: [1500, 1500],
  lie: [5000, 10000],
  play: [2000, 2000],
  run: [1000, 2000],
};

function randBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function getBehaviorWeights(
  stats: PetStats,
  emotion: PetEmotion
): BehaviorWeights {
  const w = { ...BASE_WEIGHTS };

  // 배고플 때: 걷기 증가, 활발한 행동 감소
  if (stats.hunger < 30) {
    w.walk += 15;
    w.run = Math.max(0, w.run - 3);
    w.play = Math.max(0, w.play - 3);
  }

  // 피곤할 때: 앉기/눕기/하품 증가, 달리기/걷기 감소
  if (stats.energy < 30) {
    w.sit += 20;
    w.yawn += 12;
    w.lie += 10;
    w.run = 0;
    w.walk = Math.max(5, w.walk - 15);
  }

  // 기분 나쁠 때: 앉기 증가, 눕기 금지, 달리기/놀기 감소
  if (stats.mood < 30) {
    w.sit += 15;
    w.lie = 0;
    w.run = Math.max(0, w.run - 3);
    w.play = Math.max(0, w.play - 4);
  }

  // 기분 좋을 때: 달리기/놀기 증가, 눕기 허용 증가
  if (emotion === "happy") {
    w.run += 12;
    w.play += 10;
    w.lie += 5;
  }

  // 슬플 때: 앉기 증가, 눕기 금지
  if (emotion === "sad") {
    w.sit += 12;
    w.lie = 0;
  }

  // 졸릴 때: 하품/앉기 대폭 증가
  if (emotion === "sleepy") {
    w.yawn += 15;
    w.sit += 15;
    w.lie += 10;
    w.run = 0;
  }

  // 화날 때: 눕기 금지
  if (emotion === "angry") {
    w.lie = 0;
    w.run = Math.max(0, w.run - 3);
  }

  return w;
}

function weightedRandom(weights: BehaviorWeights): BehaviorType {
  const entries = Object.entries(weights) as [BehaviorType, number][];
  const total = entries.reduce((sum, [, w]) => sum + w, 0);

  let threshold = Math.random() * total;
  for (const [type, weight] of entries) {
    threshold -= weight;
    if (threshold <= 0) return type;
  }
  return "idle";
}

export function selectNextBehavior(
  stats: PetStats,
  emotion: PetEmotion,
  screenWidth: number,
  currentX: number,
  screenHeight?: number,
  currentY?: number
): Behavior {
  const weights = getBehaviorWeights(stats, emotion);
  const type = weightedRandom(weights);

  const [minDur, maxDur] = DURATION_RANGES[type];
  const duration = Math.round(randBetween(minDur, maxDur));

  const margin = 60;
  let targetX: number | undefined;
  let targetY: number | undefined;

  if (type === "walk" || type === "run") {
    const minX = margin;
    const maxX = screenWidth - margin;
    const goRight = currentX < screenWidth / 2 ? Math.random() < 0.65 : Math.random() < 0.35;
    if (goRight) {
      targetX = Math.round(randBetween(Math.min(currentX + 80, maxX), maxX));
    } else {
      targetX = Math.round(randBetween(minX, Math.max(currentX - 80, minX)));
    }
    targetX = Math.max(minX, Math.min(maxX, targetX));

    if (screenHeight && currentY !== undefined) {
      const minY = margin;
      const maxY = screenHeight - margin;
      const goDown = currentY < screenHeight / 2 ? Math.random() < 0.6 : Math.random() < 0.4;
      if (goDown) {
        targetY = Math.round(randBetween(Math.min(currentY + 50, maxY), maxY));
      } else {
        targetY = Math.round(randBetween(minY, Math.max(currentY - 50, minY)));
      }
      targetY = Math.max(minY, Math.min(maxY, targetY));
    }
  }

  return { type, duration, targetX, targetY };
}

export function getBehaviorAnimation(type: BehaviorType): AnimationName {
  const map: Record<BehaviorType, AnimationName> = {
    walk: "walk",
    run: "run",
    idle: "idle",
    sit: "sit",
    groom: "groom",
    yawn: "yawn",
    lie: "lie",
    play: "play",
  };
  return map[type];
}
