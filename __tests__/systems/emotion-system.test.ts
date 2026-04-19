import { describe, it, expect } from "vitest";
import { determineEmotion } from "@/systems/emotion-system";
import type { PetStats } from "@/types/pet";

describe("emotion-system", () => {
  it("모든 스탯이 70 이상이면 happy", () => {
    const stats: PetStats = { hunger: 70, mood: 80, energy: 90 };
    expect(determineEmotion(stats)).toBe("happy");
  });

  it("모든 스탯이 정확히 70이면 happy", () => {
    const stats: PetStats = { hunger: 70, mood: 70, energy: 70 };
    expect(determineEmotion(stats)).toBe("happy");
  });

  it("hunger가 20 미만이면 angry (angry가 happy보다 우선)", () => {
    const stats: PetStats = { hunger: 19, mood: 80, energy: 80 };
    expect(determineEmotion(stats)).toBe("angry");
  });

  it("mood가 20 미만이면 angry", () => {
    const stats: PetStats = { hunger: 80, mood: 15, energy: 80 };
    expect(determineEmotion(stats)).toBe("angry");
  });

  it("energy가 20 미만이면 angry", () => {
    const stats: PetStats = { hunger: 80, mood: 80, energy: 10 };
    expect(determineEmotion(stats)).toBe("angry");
  });

  it("energy가 30 미만이면 sleepy (angry 조건 아닐 때)", () => {
    const stats: PetStats = { hunger: 60, mood: 60, energy: 25 };
    expect(determineEmotion(stats)).toBe("sleepy");
  });

  it("energy가 정확히 30이면 sleepy 아님", () => {
    const stats: PetStats = { hunger: 60, mood: 60, energy: 30 };
    expect(determineEmotion(stats)).not.toBe("sleepy");
  });

  it("아무 스탯이 40 미만이면 sad (angry/sleepy 조건 아닐 때)", () => {
    const stats: PetStats = { hunger: 35, mood: 60, energy: 60 };
    expect(determineEmotion(stats)).toBe("sad");
  });

  it("mood가 40 미만이면 sad", () => {
    const stats: PetStats = { hunger: 60, mood: 38, energy: 60 };
    expect(determineEmotion(stats)).toBe("sad");
  });

  it("모든 스탯이 40~69 사이면 neutral", () => {
    const stats: PetStats = { hunger: 50, mood: 50, energy: 50 };
    expect(determineEmotion(stats)).toBe("neutral");
  });

  it("happy 조건 미충족이면 neutral (69점)", () => {
    const stats: PetStats = { hunger: 69, mood: 80, energy: 80 };
    expect(determineEmotion(stats)).toBe("neutral");
  });
});
