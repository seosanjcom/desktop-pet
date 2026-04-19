'use client';

import { useState, useCallback, useRef, useEffect } from "react";
import { usePetStore } from "@/stores/pet-store";
import { PetCharacter } from "@/components/pet-canvas";
import { MiniStat } from "@/components/mini-stat";
import { MiniActions } from "@/components/mini-actions";
import { FloatingSpeechBubble } from "@/components/floating-speech-bubble";
import { OnboardingModal } from "@/components/onboarding-modal";
import { SettingsModal } from "@/components/settings-modal";
import {
  shouldTriggerChat,
  getRandomMessage,
  getActionReactionMessage,
  getNeglectMessage,
  getWelcomeMessage,
} from "@/systems/chat-system";
import {
  type DesktopIcon,
  findNearbyIcon,
  getIconMessage,
} from "@/systems/icon-chat-system";

export default function Home() {
  const { isOnboarded } = usePetStore();
  const [showSettings, setShowSettings] = useState(false);

  // 말풍선 상태 (page에서 통합 관리)
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [petPos, setPetPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPetPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }
  }, []);

  const showMessage = useCallback((msg: string, duration = 4000) => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setMessage(msg);
    setVisible(true);
    hideTimerRef.current = setTimeout(() => setVisible(false), duration);
  }, []);

  const hideMessage = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setVisible(false);
  }, []);

  // pet-canvas에서 보내오는 메시지 핸들러
  const handlePetMessage = useCallback((msg: string, duration?: number) => {
    showMessage(msg, duration);
  }, [showMessage]);

  // 자율 대화 (useSpeech 훅의 로직과 연결)
  const {
    currentEmotion,
    currentAnimation,
    petName,
    stats,
    lastChatTime,
    lastActionTime,
    setChatTime,
    characterType,
    userOccupation,
    isOnboarded: onboarded,
  } = usePetStore();

  const visibleRef = useRef(visible);
  visibleRef.current = visible;

  const chatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 바탕화면 아이콘 데이터 (Electron에서만 동작)
  const [desktopIcons, setDesktopIcons] = useState<DesktopIcon[]>([]);
  const lastIconChatRef = useRef<string>("");
  const iconChatCooldownRef = useRef(0);

  useEffect(() => {
    const api = (window as unknown as { electronAPI?: { isElectron: boolean; getDesktopIcons: () => Promise<DesktopIcon[]> } }).electronAPI;
    if (!api?.isElectron) return;

    let active = true;
    async function load() {
      const icons = await api!.getDesktopIcons();
      if (active) setDesktopIcons(icons);
    }
    load();
    const interval = setInterval(load, 30000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  useEffect(() => {
    if (!onboarded) return;
    const msg = getWelcomeMessage(petName, characterType);
    const t = setTimeout(() => {
      showMessage(msg, 5000);
      setChatTime(Date.now());
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboarded]);

  // 이미지 변경 시 말풍선 즉시 숨기기
  useEffect(() => {
    if (!onboarded) return;
    hideMessage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAnimation]);

  // 행동 리액션
  const prevAnimRef = useRef(currentAnimation);
  useEffect(() => {
    if (!onboarded) return;
    const prev = prevAnimRef.current;
    const curr = currentAnimation;
    if (curr === "idle" && (prev === "eat" || prev === "play" || prev === "sleep")) {
      const actionMap: Record<string, "feed" | "play" | "sleep"> = {
        eat: "feed", play: "play", sleep: "sleep",
      };
      const action = actionMap[prev];
      if (action) {
        showMessage(getActionReactionMessage(action, characterType), 3500);
        setChatTime(Date.now());
      }
    }
    prevAnimRef.current = curr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAnimation, onboarded]);

  // 수시 대화
  useEffect(() => {
    if (!onboarded) return;

    function scheduleTick() {
      chatTimerRef.current = setTimeout(() => {
        const now = Date.now();
        const neglectElapsed = now - lastActionTime;
        if (neglectElapsed > 0) {
          const neglectMsg = getNeglectMessage(neglectElapsed, characterType);
          if (neglectMsg && !visibleRef.current) {
            showMessage(neglectMsg, 4000);
            setChatTime(now);
            scheduleTick();
            return;
          }
        }
        if (shouldTriggerChat(lastChatTime, now)) {
          const hour = new Date().getHours();
          const msg = getRandomMessage(currentEmotion, stats, lastActionTime, hour, characterType, userOccupation);
          if (!visibleRef.current) {
            showMessage(msg, 4000);
            setChatTime(now);
          }
        }
        scheduleTick();
      }, 60000);
    }

    scheduleTick();
    return () => {
      if (chatTimerRef.current) clearTimeout(chatTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboarded, currentEmotion, stats, lastChatTime, lastActionTime]);

  const handlePositionChange = useCallback((x: number, y: number) => {
    setPetPos({ x, y: y - 50 }); // 캐릭터 상단 위치
  }, []);

  // 펫 위치 추적 + 아이콘 근접 감지
  const desktopIconsRef = useRef(desktopIcons);
  desktopIconsRef.current = desktopIcons;

  useEffect(() => {
    let rafId: number;
    let iconCheckCounter = 0;
    function trackPet() {
      const petEl = document.querySelector("[data-pet-character]") as HTMLElement;
      if (petEl) {
        const rect = petEl.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top;
        setPetPos({ x: cx, y: cy });

        iconCheckCounter++;
        if (iconCheckCounter % 60 === 0 && desktopIconsRef.current.length > 0) {
          const now = Date.now();
          if (now > iconChatCooldownRef.current && !visibleRef.current) {
            const nearby = findNearbyIcon(cx, cy + 50, desktopIconsRef.current, 100);
            if (nearby && nearby.name !== lastIconChatRef.current) {
              showMessage(getIconMessage(nearby, characterType), 4500);
              setChatTime(now);
              lastIconChatRef.current = nearby.name;
              iconChatCooldownRef.current = now + 20000;
            }
          }
        }
      }
      rafId = requestAnimationFrame(trackPet);
    }
    rafId = requestAnimationFrame(trackPet);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterType]);

  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        background: "transparent",
        overflow: "hidden",
      }}
    >
      {!isOnboarded && <OnboardingModal />}

      {/* 말풍선 (캐릭터 위에 따라다님) */}
      <FloatingSpeechBubble
        message={message}
        visible={visible}
        petX={petPos.x}
        petY={petPos.y}
      />

      {/* 캐릭터 */}
      {isOnboarded && (
        <PetCharacter
          onPetMessage={handlePetMessage}
          onPositionChange={handlePositionChange}
          desktopIcons={desktopIcons}
        />
      )}

      {/* 미니 스탯 (좌측 하단) */}
      {isOnboarded && <MiniStat />}

      {/* 미니 액션 (우측 하단) */}
      {isOnboarded && <MiniActions onAction={handlePetMessage} />}

      {/* 설정 버튼 (좌측 상단) */}
      {isOnboarded && (
        <button
          onClick={() => setShowSettings(true)}
          style={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 30,
            width: 36,
            height: 36,
            borderRadius: 12,
            border: "none",
            background: "rgba(148,163,184,0.15)",
            color: "#94a3b8",
            fontSize: 18,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
          aria-label="설정"
        >
          ⚙
        </button>
      )}

      {/* 설정 모달 */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </main>
  );
}
