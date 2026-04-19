import { describe, it, expect } from "vitest";
import { calculateOfflineElapsed, applyOfflineDecay } from "@/systems/offline-system";
import type { PetStats } from "@/types/pet";

describe("offline-system", () => {
  describe("calculateOfflineElapsed", () => {
    it("현재 시간과 마지막 저장 시간 차이를 반환한다", () => {
      const lastSaved = 1000000;
      const now = 1060000; // 60초 후
      const elapsed = calculateOfflineElapsed(lastSaved, now);
      expect(elapsed).toBe(60000);
    });

    it("음수 경과 시간은 0으로 처리한다 (시계 조작 방지)", () => {
      const lastSaved = 1060000;
      const now = 1000000; // 과거
      const elapsed = calculateOfflineElapsed(lastSaved, now);
      expect(elapsed).toBe(0);
    });

    it("동일 시간이면 0을 반환한다", () => {
      const now = 1000000;
      const elapsed = calculateOfflineElapsed(now, now);
      expect(elapsed).toBe(0);
    });

    it("최대 24시간으로 캡된다", () => {
      const lastSaved = 0;
      const now = 25 * 60 * 60 * 1000; // 25시간
      const elapsed = calculateOfflineElapsed(lastSaved, now);
      expect(elapsed).toBe(24 * 60 * 60 * 1000);
    });

    it("정확히 24시간이면 24시간을 반환한다", () => {
      const lastSaved = 0;
      const now = 24 * 60 * 60 * 1000;
      const elapsed = calculateOfflineElapsed(lastSaved, now);
      expect(elapsed).toBe(24 * 60 * 60 * 1000);
    });
  });

  describe("applyOfflineDecay", () => {
    const fullStats: PetStats = { hunger: 100, mood: 100, energy: 100 };

    it("60분 오프라인 시 각 스탯이 60 감소한다", () => {
      const elapsedMs = 60 * 60 * 1000;
      const result = applyOfflineDecay(fullStats, elapsedMs);
      expect(result.hunger).toBe(40);
      expect(result.mood).toBe(40);
      expect(result.energy).toBe(40);
    });

    it("스탯은 0 미만으로 내려가지 않는다", () => {
      const lowStats: PetStats = { hunger: 10, mood: 10, energy: 10 };
      const elapsedMs = 60 * 60 * 1000; // 60분
      const result = applyOfflineDecay(lowStats, elapsedMs);
      expect(result.hunger).toBe(0);
      expect(result.mood).toBe(0);
      expect(result.energy).toBe(0);
    });

    it("0ms 경과 시 스탯이 변하지 않는다", () => {
      const result = applyOfflineDecay(fullStats, 0);
      expect(result.hunger).toBe(100);
      expect(result.mood).toBe(100);
      expect(result.energy).toBe(100);
    });

    it("24시간 오프라인 시 스탯이 최대 감소값에 도달한다", () => {
      const elapsedMs = 24 * 60 * 60 * 1000; // 24시간 = 1440분 감소
      const result = applyOfflineDecay(fullStats, elapsedMs);
      expect(result.hunger).toBe(0);
      expect(result.mood).toBe(0);
      expect(result.energy).toBe(0);
    });
  });
});
