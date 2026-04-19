import { describe, it, expect } from "vitest";
import {
  selectNextBehavior,
  getBehaviorAnimation,
  getBehaviorWeights,
} from "@/systems/behavior-system";
import type { PetStats, PetEmotion, BehaviorType } from "@/types/pet";

const fullStats: PetStats = { hunger: 100, mood: 100, energy: 100 };
const hungryStats: PetStats = { hunger: 15, mood: 80, energy: 80 };
const tiredStats: PetStats = { hunger: 80, mood: 80, energy: 15 };
const sadStats: PetStats = { hunger: 80, mood: 15, energy: 80 };
const happyStats: PetStats = { hunger: 90, mood: 90, energy: 90 };

describe("behavior-system", () => {
  describe("selectNextBehavior", () => {
    it("결과가 Behavior 인터페이스를 만족한다", () => {
      const b = selectNextBehavior(fullStats, "neutral", 1280, 200);
      expect(b).toHaveProperty("type");
      expect(b).toHaveProperty("duration");
      expect(typeof b.type).toBe("string");
      expect(typeof b.duration).toBe("number");
      expect(b.duration).toBeGreaterThan(0);
    });

    it("walk/run 행동에는 targetX가 있다", () => {
      // 100회 시도해서 walk 또는 run이 나올 때 targetX 확인
      for (let i = 0; i < 100; i++) {
        const b = selectNextBehavior(fullStats, "neutral", 1280, 200);
        if (b.type === "walk" || b.type === "run") {
          expect(b.targetX).toBeDefined();
          expect(typeof b.targetX).toBe("number");
        }
      }
    });

    it("targetX는 화면 너비 범위 내에 있다", () => {
      const screenWidth = 1280;
      for (let i = 0; i < 50; i++) {
        const b = selectNextBehavior(fullStats, "neutral", screenWidth, 200);
        if (b.targetX !== undefined) {
          expect(b.targetX).toBeGreaterThanOrEqual(60);
          expect(b.targetX).toBeLessThanOrEqual(screenWidth - 60);
        }
      }
    });

    it("배고플 때 lie 행동이 선택되지 않는다 (lie는 기분 좋을 때만)", () => {
      const types = new Set<BehaviorType>();
      for (let i = 0; i < 200; i++) {
        const b = selectNextBehavior(hungryStats, "angry", 1280, 200);
        types.add(b.type);
      }
      expect(types.has("lie")).toBe(false);
    });

    it("피곤할 때 sit/yawn/lie 가중치가 높아야 한다 (200회 중 50회 이상)", () => {
      let restCount = 0;
      for (let i = 0; i < 200; i++) {
        const b = selectNextBehavior(tiredStats, "sleepy", 1280, 200);
        if (b.type === "sit" || b.type === "yawn" || b.type === "lie") {
          restCount++;
        }
      }
      expect(restCount).toBeGreaterThan(50);
    });

    it("기분 좋을 때 run/play 가중치가 높아야 한다 (200회 중 30회 이상)", () => {
      let activeCount = 0;
      for (let i = 0; i < 200; i++) {
        const b = selectNextBehavior(happyStats, "happy", 1280, 200);
        if (b.type === "run" || b.type === "play") {
          activeCount++;
        }
      }
      expect(activeCount).toBeGreaterThan(30);
    });

    it("기분 나쁠 때 sit 행동이 증가한다", () => {
      let sitCount = 0;
      for (let i = 0; i < 200; i++) {
        const b = selectNextBehavior(sadStats, "sad", 1280, 200);
        if (b.type === "sit") {
          sitCount++;
        }
      }
      expect(sitCount).toBeGreaterThan(20);
    });

    it("duration은 행동 타입에 따라 적절한 범위를 가진다", () => {
      const durationMap: Record<BehaviorType, [number, number]> = {
        walk: [2000, 5000],
        idle: [1000, 3000],
        sit: [3000, 8000],
        groom: [2000, 3000],
        yawn: [1500, 1500],
        lie: [5000, 10000],
        play: [2000, 2000],
        run: [1000, 2000],
      };
      for (let i = 0; i < 100; i++) {
        const b = selectNextBehavior(fullStats, "neutral", 1280, 200);
        const [minD, maxD] = durationMap[b.type];
        expect(b.duration).toBeGreaterThanOrEqual(minD - 1);
        expect(b.duration).toBeLessThanOrEqual(maxD + 1);
      }
    });
  });

  describe("getBehaviorAnimation", () => {
    it("walk → 'walk' 애니메이션", () => {
      expect(getBehaviorAnimation("walk")).toBe("walk");
    });
    it("run → 'run' 애니메이션", () => {
      expect(getBehaviorAnimation("run")).toBe("run");
    });
    it("idle → 'idle' 애니메이션", () => {
      expect(getBehaviorAnimation("idle")).toBe("idle");
    });
    it("sit → 'sit' 애니메이션", () => {
      expect(getBehaviorAnimation("sit")).toBe("sit");
    });
    it("groom → 'groom' 애니메이션", () => {
      expect(getBehaviorAnimation("groom")).toBe("groom");
    });
    it("yawn → 'yawn' 애니메이션", () => {
      expect(getBehaviorAnimation("yawn")).toBe("yawn");
    });
    it("lie → 'lie' 애니메이션", () => {
      expect(getBehaviorAnimation("lie")).toBe("lie");
    });
    it("play → 'play' 애니메이션", () => {
      expect(getBehaviorAnimation("play")).toBe("play");
    });
  });

  describe("getBehaviorWeights", () => {
    it("모든 가중치 합은 양수이다", () => {
      const weights = getBehaviorWeights(fullStats, "neutral");
      const total = Object.values(weights).reduce((a, b) => a + b, 0);
      expect(total).toBeGreaterThan(0);
    });

    it("모든 가중치는 0 이상이다", () => {
      const weights = getBehaviorWeights(hungryStats, "angry");
      for (const w of Object.values(weights)) {
        expect(w).toBeGreaterThanOrEqual(0);
      }
    });

    it("행복 상태에서 lie 가중치 > 0", () => {
      const weights = getBehaviorWeights(happyStats, "happy");
      expect(weights.lie).toBeGreaterThan(0);
    });

    it("기분 나쁠 때 lie 가중치 === 0", () => {
      const weights = getBehaviorWeights(sadStats, "sad");
      expect(weights.lie).toBe(0);
    });

    // edge cases
    it("에너지 0일 때 run 가중치 === 0", () => {
      const exhausted: PetStats = { hunger: 80, mood: 80, energy: 0 };
      const weights = getBehaviorWeights(exhausted, "sleepy");
      expect(weights.run).toBe(0);
    });

    it("배고픔 0일 때 walk 가중치가 기본보다 높다", () => {
      const starving: PetStats = { hunger: 0, mood: 80, energy: 80 };
      const normalWeights = getBehaviorWeights(fullStats, "neutral");
      const starvingWeights = getBehaviorWeights(starving, "angry");
      expect(starvingWeights.walk).toBeGreaterThan(normalWeights.walk);
    });
  });
});
