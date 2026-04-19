import { describe, it, expect } from "vitest";
import { applyStatDecay } from "@/systems/stat-system";
import type { PetStats } from "@/types/pet";

describe("stat-system", () => {
  const fullStats: PetStats = { hunger: 100, mood: 100, energy: 100 };

  it("60초 경과 시 각 스탯이 1씩 감소한다", () => {
    const result = applyStatDecay(fullStats, 60 * 1000);
    expect(result.hunger).toBe(99);
    expect(result.mood).toBe(99);
    expect(result.energy).toBe(99);
  });

  it("120초 경과 시 각 스탯이 2씩 감소한다", () => {
    const result = applyStatDecay(fullStats, 120 * 1000);
    expect(result.hunger).toBe(98);
    expect(result.mood).toBe(98);
    expect(result.energy).toBe(98);
  });

  it("스탯은 0 아래로 내려가지 않는다", () => {
    const lowStats: PetStats = { hunger: 0, mood: 0, energy: 0 };
    const result = applyStatDecay(lowStats, 60 * 1000);
    expect(result.hunger).toBe(0);
    expect(result.mood).toBe(0);
    expect(result.energy).toBe(0);
  });

  it("0ms 경과 시 스탯이 변하지 않는다", () => {
    const result = applyStatDecay(fullStats, 0);
    expect(result.hunger).toBe(100);
    expect(result.mood).toBe(100);
    expect(result.energy).toBe(100);
  });

  it("30초 경과 시 스탯이 0.5씩 감소한다", () => {
    const result = applyStatDecay(fullStats, 30 * 1000);
    expect(result.hunger).toBeCloseTo(99.5, 5);
    expect(result.mood).toBeCloseTo(99.5, 5);
    expect(result.energy).toBeCloseTo(99.5, 5);
  });

  it("원본 stats 객체를 변경하지 않는다 (순수 함수)", () => {
    const original = { hunger: 80, mood: 80, energy: 80 };
    applyStatDecay(original, 60 * 1000);
    expect(original.hunger).toBe(80);
  });
});
