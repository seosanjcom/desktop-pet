'use client';

import { useState, useCallback, useRef, useEffect } from "react";
import { usePetStore } from "@/stores/pet-store";
import {
  shouldTriggerChat,
  getRandomMessage,
  getActionReactionMessage,
  getNeglectMessage,
} from "@/systems/chat-system";
import type { AnimationName } from "@/types/pet";

const VISIT_MESSAGES = {
  first: "안녕! 나는 네 고양이야~ 잘 부탁해냥! 🐾",
  returning: (name: string) => `${name}~ 왔어! 보고 싶었다냥! 💕`,
};

interface UseSpeechReturn {
  message: string | null;
  visible: boolean;
  showMessage: (msg: string, duration?: number) => void;
}

export function useSpeech(): UseSpeechReturn {
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevAnimationRef = useRef<AnimationName>("idle");

  const {
    currentEmotion,
    currentAnimation,
    petName,
    isOnboarded,
    stats,
    lastChatTime,
    lastActionTime,
    setChatTime,
  } = usePetStore();

  const showMessage = useCallback((msg: string, duration = 4000) => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setMessage(msg);
    setVisible(true);
    hideTimerRef.current = setTimeout(() => setVisible(false), duration);
  }, []);

  // 온보딩 완료 시 첫 인사
  useEffect(() => {
    if (!isOnboarded) return;
    const msg = petName
      ? VISIT_MESSAGES.returning(petName)
      : VISIT_MESSAGES.first;
    const t = setTimeout(() => {
      showMessage(msg, 5000);
      setChatTime(Date.now());
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnboarded]);

  // 행동 리액션
  useEffect(() => {
    if (!isOnboarded) return;
    const prev = prevAnimationRef.current;
    const curr = currentAnimation;
    if (curr === "idle" && (prev === "eat" || prev === "play" || prev === "sleep")) {
      const actionMap: Record<string, "feed" | "play" | "sleep"> = {
        eat: "feed",
        play: "play",
        sleep: "sleep",
      };
      const action = actionMap[prev];
      if (action) {
        const msg = getActionReactionMessage(action);
        showMessage(msg, 3500);
        setChatTime(Date.now());
      }
    }
    prevAnimationRef.current = curr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAnimation, isOnboarded]);

  // 수시 대화 타이머
  useEffect(() => {
    if (!isOnboarded) return;

    function scheduleTick() {
      chatTimerRef.current = setTimeout(() => {
        const now = Date.now();
        const neglectElapsed = now - lastActionTime;
        if (neglectElapsed > 0) {
          const neglectMsg = getNeglectMessage(neglectElapsed);
          if (neglectMsg && !visible) {
            showMessage(neglectMsg, 4000);
            setChatTime(now);
            scheduleTick();
            return;
          }
        }
        if (shouldTriggerChat(lastChatTime, now)) {
          const hour = new Date().getHours();
          const msg = getRandomMessage(currentEmotion, stats, lastActionTime, hour);
          if (!visible) {
            showMessage(msg, 4000);
            setChatTime(now);
          }
        }
        scheduleTick();
      }, 8000);
    }

    scheduleTick();
    return () => {
      if (chatTimerRef.current) clearTimeout(chatTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnboarded, currentEmotion, stats, lastChatTime, lastActionTime]);

  return { message, visible, showMessage };
}
