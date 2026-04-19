import { describe, it, expect, beforeEach } from "vitest";
import { act } from "@testing-library/react";

// localStorage 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(global, "localStorage", { value: localStorageMock });

describe("pet-store", () => {
  let usePetStore: typeof import("@/stores/pet-store").usePetStore;

  beforeEach(async () => {
    localStorageMock.clear();
    // 매 테스트마다 모듈 재import (zustand persist 초기화)
    const mod = await import("@/stores/pet-store");
    usePetStore = mod.usePetStore;
    // 스토어 초기화
    act(() => {
      usePetStore.getState().resetPet();
    });
  });

  it("초기 상태에서 isOnboarded는 false", () => {
    const state = usePetStore.getState();
    expect(state.isOnboarded).toBe(false);
  });

  it("createPet 호출 후 isOnboarded가 true가 된다", () => {
    act(() => {
      usePetStore.getState().createPet("멍이", "유저");
    });
    const state = usePetStore.getState();
    expect(state.isOnboarded).toBe(true);
    expect(state.petName).toBe("멍이");
  });

  it("createPet 호출 시 스탯이 100으로 초기화된다", () => {
    act(() => {
      usePetStore.getState().createPet("냥이", "유저");
    });
    const state = usePetStore.getState();
    expect(state.stats.hunger).toBe(100);
    expect(state.stats.mood).toBe(100);
    expect(state.stats.energy).toBe(100);
  });

  it("feed 액션이 hunger를 증가시킨다", () => {
    act(() => {
      usePetStore.getState().createPet("테스트", "유저");
      usePetStore.setState((s) => ({ stats: { ...s.stats, hunger: 50 } }));
      usePetStore.getState().feed();
    });
    const state = usePetStore.getState();
    expect(state.stats.hunger).toBe(70);
  });

  it("play 액션이 mood를 증가시키고 energy를 감소시킨다", () => {
    act(() => {
      usePetStore.getState().createPet("테스트", "유저");
      usePetStore.setState((s) => ({ stats: { ...s.stats, mood: 50, energy: 50 } }));
      usePetStore.getState().play();
    });
    const state = usePetStore.getState();
    expect(state.stats.mood).toBe(70);
    expect(state.stats.energy).toBe(45);
  });

  it("sleep 액션이 energy를 증가시키고 mood를 감소시킨다", () => {
    act(() => {
      usePetStore.getState().createPet("테스트", "유저");
      usePetStore.setState((s) => ({ stats: { ...s.stats, energy: 50, mood: 50 } }));
      usePetStore.getState().sleep();
    });
    const state = usePetStore.getState();
    expect(state.stats.energy).toBe(75);
    expect(state.stats.mood).toBe(45);
  });

  it("resetPet 호출 후 isOnboarded가 false가 된다", () => {
    act(() => {
      usePetStore.getState().createPet("테스트", "유저");
      usePetStore.getState().resetPet();
    });
    expect(usePetStore.getState().isOnboarded).toBe(false);
  });

  it("updateStats가 스탯을 업데이트한다", () => {
    act(() => {
      usePetStore.getState().createPet("테스트", "유저");
      usePetStore.getState().updateStats({ hunger: 30, mood: 40, energy: 50 });
    });
    const state = usePetStore.getState();
    expect(state.stats.hunger).toBe(30);
    expect(state.stats.mood).toBe(40);
    expect(state.stats.energy).toBe(50);
  });

  it("액션 후 emotion이 업데이트된다", () => {
    act(() => {
      usePetStore.getState().createPet("테스트", "유저");
    });
    // 모든 스탯 100이면 happy
    expect(usePetStore.getState().currentEmotion).toBe("happy");
  });
});
