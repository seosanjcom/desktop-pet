import { describe, it, expect } from "vitest";
import { feedPet, playWithPet, sleepPet } from "@/systems/action-system";
import type { PetStats } from "@/types/pet";

describe("action-system", () => {
  const midStats: PetStats = { hunger: 50, mood: 50, energy: 50 };

  describe("feedPet", () => {
    it("hunger를 20 증가시킨다", () => {
      const result = feedPet(midStats);
      expect(result.hunger).toBe(70);
    });

    it("mood, energy는 변하지 않는다", () => {
      const result = feedPet(midStats);
      expect(result.mood).toBe(50);
      expect(result.energy).toBe(50);
    });

    it("hunger가 100을 초과하지 않는다", () => {
      const highHunger: PetStats = { hunger: 90, mood: 50, energy: 50 };
      const result = feedPet(highHunger);
      expect(result.hunger).toBe(100);
    });

    it("원본 stats를 변경하지 않는다", () => {
      const original = { ...midStats };
      feedPet(midStats);
      expect(midStats.hunger).toBe(original.hunger);
    });
  });

  describe("playWithPet", () => {
    it("mood를 20 증가시킨다", () => {
      const result = playWithPet(midStats);
      expect(result.mood).toBe(70);
    });

    it("energy를 5 감소시킨다", () => {
      const result = playWithPet(midStats);
      expect(result.energy).toBe(45);
    });

    it("hunger는 변하지 않는다", () => {
      const result = playWithPet(midStats);
      expect(result.hunger).toBe(50);
    });

    it("mood는 100을 초과하지 않는다", () => {
      const highMood: PetStats = { hunger: 50, mood: 90, energy: 50 };
      const result = playWithPet(highMood);
      expect(result.mood).toBe(100);
    });

    it("energy는 0 아래로 내려가지 않는다", () => {
      const lowEnergy: PetStats = { hunger: 50, mood: 50, energy: 3 };
      const result = playWithPet(lowEnergy);
      expect(result.energy).toBe(0);
    });
  });

  describe("sleepPet", () => {
    it("energy를 25 증가시킨다", () => {
      const result = sleepPet(midStats);
      expect(result.energy).toBe(75);
    });

    it("mood를 5 감소시킨다", () => {
      const result = sleepPet(midStats);
      expect(result.mood).toBe(45);
    });

    it("hunger는 변하지 않는다", () => {
      const result = sleepPet(midStats);
      expect(result.hunger).toBe(50);
    });

    it("energy는 100을 초과하지 않는다", () => {
      const highEnergy: PetStats = { hunger: 50, mood: 50, energy: 85 };
      const result = sleepPet(highEnergy);
      expect(result.energy).toBe(100);
    });

    it("mood는 0 아래로 내려가지 않는다", () => {
      const lowMood: PetStats = { hunger: 50, mood: 3, energy: 50 };
      const result = sleepPet(lowMood);
      expect(result.mood).toBe(0);
    });
  });
});
