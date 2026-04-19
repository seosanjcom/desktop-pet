'use client';

import { useState, useEffect, useCallback, useRef } from "react";
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

export function SpeechBubble() {
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [isNew, setIsNew] = useState(false);

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

  const showMessage = useCallback(
    (msg: string, duration = 4000) => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

      setMessage(msg);
      setIsNew(true);
      setVisible(true);

      setTimeout(() => setIsNew(false), 50);

      hideTimerRef.current = setTimeout(() => {
        setVisible(false);
      }, duration);
    },
    []
  );

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

  // 행동(eat/play/sleep) 완료 리액션
  useEffect(() => {
    if (!isOnboarded) return;
    const prev = prevAnimationRef.current;
    const curr = currentAnimation;

    // 액션 -> idle 전환 시 리액션
    if (
      curr === "idle" &&
      (prev === "eat" || prev === "play" || prev === "sleep")
    ) {
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

        // 방치 체크
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

        // 랜덤 대화 트리거
        if (shouldTriggerChat(lastChatTime, now)) {
          const hour = new Date().getHours();
          const msg = getRandomMessage(
            currentEmotion,
            stats,
            lastActionTime,
            hour
          );
          if (!visible) {
            showMessage(msg, 4000);
            setChatTime(now);
          }
        }

        scheduleTick();
      }, 8000); // 8초마다 체크
    }

    scheduleTick();

    return () => {
      if (chatTimerRef.current) clearTimeout(chatTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnboarded, currentEmotion, stats, lastChatTime, lastActionTime]);

  if (!visible || !message) return null;

  return (
    <div className="relative flex justify-center w-full">
      <div
        className="absolute z-10"
        style={{
          bottom: "calc(100% + 12px)",
          left: "50%",
          transform: "translateX(-50%)",
          animation: isNew ? "bubbleIn 0.2s cubic-bezier(0.34,1.56,0.64,1)" : undefined,
        }}
      >
        <div
          className="bg-white rounded-2xl px-4 py-2.5 shadow-lg text-sm font-medium text-slate-700 whitespace-nowrap select-none"
          style={{
            boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        >
          {message}
          {/* 말풍선 꼬리 */}
          <div
            className="absolute left-1/2 top-full"
            style={{
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid white",
              filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.06))",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes bubbleIn {
          from { transform: translateX(-50%) scale(0.7); opacity: 0; }
          to   { transform: translateX(-50%) scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export function useWelcomeMessage() {
  const { petName, isOnboarded } = usePetStore();

  const getWelcomeMsg = useCallback((): string => {
    if (!isOnboarded) return VISIT_MESSAGES.first;
    return VISIT_MESSAGES.returning(petName);
  }, [isOnboarded, petName]);

  return { getWelcomeMsg };
}
