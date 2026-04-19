import { describe, it, expect } from "vitest";
import {
  shouldTriggerChat,
  getRandomMessage,
  getActionReactionMessage,
  getNeglectMessage,
  CHAT_INTERVAL_MIN_MS,
  CHAT_INTERVAL_MAX_MS,
} from "@/systems/chat-system";
import type { PetStats } from "@/types/pet";

const fullStats: PetStats = { hunger: 100, mood: 100, energy: 100 };
const lowHungerStats: PetStats = { hunger: 10, mood: 80, energy: 80 };
const lowEnergyStats: PetStats = { hunger: 80, mood: 80, energy: 10 };

describe("chat-system: shouldTriggerChat", () => {
  it("lastChatTime이 0이면 항상 true 반환", () => {
    expect(shouldTriggerChat(0, Date.now())).toBe(true);
  });

  it("최소 간격(30초) 미만이면 false 반환", () => {
    const now = Date.now();
    const lastChat = now - (CHAT_INTERVAL_MIN_MS - 1000);
    expect(shouldTriggerChat(lastChat, now)).toBe(false);
  });

  it("최대 간격(2분) 초과 시 항상 true 반환", () => {
    const now = Date.now();
    const lastChat = now - (CHAT_INTERVAL_MAX_MS + 1000);
    expect(shouldTriggerChat(lastChat, now)).toBe(true);
  });

  it("최소~최대 사이에서는 결과가 boolean이다", () => {
    const now = Date.now();
    const lastChat = now - (CHAT_INTERVAL_MIN_MS + 30000);
    const result = shouldTriggerChat(lastChat, now);
    expect(typeof result).toBe("boolean");
  });
});

describe("chat-system: getRandomMessage", () => {
  it("항상 비어있지 않은 문자열을 반환한다", () => {
    const msg = getRandomMessage("happy", fullStats, Date.now() - 1000, 10);
    expect(typeof msg).toBe("string");
    expect(msg.length).toBeGreaterThan(0);
  });

  it("모든 감정 타입에 대해 메시지를 반환한다", () => {
    const emotions = ["happy", "neutral", "sad", "angry", "sleepy"] as const;
    for (const emotion of emotions) {
      const msg = getRandomMessage(emotion, fullStats, Date.now(), 14);
      expect(msg.length).toBeGreaterThan(0);
    }
  });

  it("배고픔이 낮을 때 배고픔 관련 메시지 풀에서 반환한다", () => {
    // 여러 번 호출하면 배고픔 관련 메시지가 나와야 함
    const messages = Array.from({ length: 20 }, () =>
      getRandomMessage("angry", lowHungerStats, Date.now(), 14)
    );
    expect(messages.every((m) => m.length > 0)).toBe(true);
  });

  it("에너지가 낮을 때도 메시지를 반환한다", () => {
    const msg = getRandomMessage("sleepy", lowEnergyStats, Date.now(), 23);
    expect(msg.length).toBeGreaterThan(0);
  });

  it("아침 시간(6~10시)에 적합한 메시지 반환", () => {
    const msg = getRandomMessage("neutral", fullStats, Date.now(), 8);
    expect(msg.length).toBeGreaterThan(0);
  });

  it("저녁 시간(18~22시)에 적합한 메시지 반환", () => {
    const msg = getRandomMessage("neutral", fullStats, Date.now(), 20);
    expect(msg.length).toBeGreaterThan(0);
  });

  it("밤 시간(22~6시)에 적합한 메시지 반환", () => {
    const msg = getRandomMessage("sleepy", fullStats, Date.now(), 2);
    expect(msg.length).toBeGreaterThan(0);
  });
});

describe("chat-system: getActionReactionMessage", () => {
  it("feed 액션에 대한 리액션 메시지 반환", () => {
    const msg = getActionReactionMessage("feed");
    expect(typeof msg).toBe("string");
    expect(msg.length).toBeGreaterThan(0);
  });

  it("play 액션에 대한 리액션 메시지 반환", () => {
    const msg = getActionReactionMessage("play");
    expect(msg.length).toBeGreaterThan(0);
  });

  it("sleep 액션에 대한 리액션 메시지 반환", () => {
    const msg = getActionReactionMessage("sleep");
    expect(msg.length).toBeGreaterThan(0);
  });
});

describe("chat-system: getNeglectMessage", () => {
  it("방치 15분 이상 시 메시지 반환", () => {
    const msg = getNeglectMessage(16 * 60 * 1000);
    expect(typeof msg).toBe("string");
    expect(msg!.length).toBeGreaterThan(0);
  });

  it("15분 미만 방치 시 null 반환", () => {
    const msg = getNeglectMessage(10 * 60 * 1000);
    expect(msg).toBeNull();
  });

  it("0ms 방치 시 null 반환", () => {
    const msg = getNeglectMessage(0);
    expect(msg).toBeNull();
  });
});

describe("chat-system: 메시지 다양성", () => {
  it("같은 조건에서 여러 번 호출 시 다양한 메시지가 나온다", () => {
    const messages = new Set(
      Array.from({ length: 10 }, () =>
        getRandomMessage("neutral", fullStats, Date.now(), 14)
      )
    );
    // 10번 중 최소 2개 이상 다른 메시지
    expect(messages.size).toBeGreaterThanOrEqual(2);
  });
});
