'use client';

import { useRef, useEffect, useCallback, useState } from "react";
import { usePetStore } from "@/stores/pet-store";
import { renderPet } from "@/engine/sprite-renderer";
import type { CursorPos } from "@/engine/sprite-renderer";
import { useGameLoop } from "@/hooks/use-game-loop";
import { useVisibility } from "@/hooks/use-visibility";
import { applyStatDecay } from "@/systems/stat-system";
import { applyOfflineDecay, calculateOfflineElapsed } from "@/systems/offline-system";
import { selectNextBehavior, getBehaviorAnimation } from "@/systems/behavior-system";
import { CANVAS_LOGICAL_SIZE } from "@/lib/constants";
import { getDragMessage, getHoverMessage } from "@/systems/chat-system";
import type { Behavior } from "@/types/pet";
import type { DesktopIcon } from "@/systems/icon-chat-system";

const PET_CANVAS_SIZE = 100;
const DRAG_CLICK_THRESHOLD_MS = 200;
const GRAVITY = 0.6;
const BOUNCE_DAMPING = 0.45;
const MARGIN = 60;
const FLOOR_MARGIN = 50;
const HOVER_MSG_COOLDOWN = 25000;

interface PetPosition {
  x: number;
  y: number;
}

interface DragState {
  isDragging: boolean;
  offsetX: number;
  offsetY: number;
  startTime: number;
  hasMoved: boolean;
}

interface SquashState {
  active: boolean;
  startTime: number;
}

interface PetCharacterProps {
  onPetMessage: (msg: string, duration?: number) => void;
  onPositionChange?: (x: number, y: number) => void;
  desktopIcons?: DesktopIcon[];
}

export function PetCharacter({ onPetMessage, onPositionChange, desktopIcons = [] }: PetCharacterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const squashContainerRef = useRef<HTMLDivElement>(null);
  const isVisible = useVisibility();

  const posRef = useRef<PetPosition>({ x: 0, y: 0 });
  const [pos, setPos] = useState<PetPosition>({ x: 0, y: 0 });
  const [facingLeft, setFacingLeft] = useState(false);
  const facingLeftRef = useRef(false);

  const dragRef = useRef<DragState>({
    isDragging: false,
    offsetX: 0,
    offsetY: 0,
    startTime: 0,
    hasMoved: false,
  });

  const fallingRef = useRef(false);
  const velYRef = useRef(0);
  const squashRef = useRef<SquashState>({ active: false, startTime: 0 });

  const cursorPosRef = useRef<CursorPos | null>(null);

  const behaviorRef = useRef<Behavior | null>(null);
  const behaviorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lastHoverMsgRef = useRef(0);

  const {
    stats,
    currentEmotion,
    currentAnimation,
    lastSavedAt,
    isOnboarded,
    updateStats,
    petName,
    characterType,
  } = usePetStore();

  useEffect(() => {
    function initPos() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const initX = w * 0.5;
      const initY = h * 0.5;
      posRef.current = { x: initX, y: initY };
      setPos({ x: initX, y: initY });
      onPositionChange?.(initX, initY);
    }
    initPos();
    window.addEventListener("resize", initPos);
    return () => window.removeEventListener("resize", initPos);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isOnboarded || !isVisible) return;
    const elapsed = calculateOfflineElapsed(lastSavedAt, Date.now());
    if (elapsed > 1000) {
      const newStats = applyOfflineDecay(stats, elapsed);
      updateStats(newStats);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, isOnboarded]);

  const desktopIconsRef = useRef(desktopIcons);
  desktopIconsRef.current = desktopIcons;

  const scheduleNextBehavior = useCallback(() => {
    if (behaviorTimerRef.current) clearTimeout(behaviorTimerRef.current);
    if (!isOnboarded) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const behavior = selectNextBehavior(stats, currentEmotion, w, posRef.current.x, h, posRef.current.y);
    behaviorRef.current = behavior;

    // 40% 확률로 아이콘 위치를 목표로 설정
    const icons = desktopIconsRef.current;
    if (icons.length > 0 && (behavior.type === "walk" || behavior.type === "run") && Math.random() < 0.4) {
      const icon = icons[Math.floor(Math.random() * icons.length)];
      behavior.targetX = icon.x + 30;
      behavior.targetY = icon.y + 30;
    }

    const anim = getBehaviorAnimation(behavior.type);
    usePetStore.setState({ currentAnimation: anim });

    if (behavior.targetX !== undefined) {
      const goLeft = behavior.targetX < posRef.current.x;
      facingLeftRef.current = goLeft;
      setFacingLeft(goLeft);
    }

    behaviorTimerRef.current = setTimeout(() => {
      behaviorRef.current = null;
      usePetStore.setState({ currentAnimation: "idle" });
      scheduleNextBehavior();
    }, behavior.duration);
  }, [isOnboarded, stats, currentEmotion]);

  useEffect(() => {
    if (!isOnboarded) return;
    const t = setTimeout(scheduleNextBehavior, 1500);
    return () => {
      clearTimeout(t);
      if (behaviorTimerRef.current) clearTimeout(behaviorTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnboarded]);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragRef.current.isDragging) return;
      dragRef.current.hasMoved = true;
      const newX = e.clientX - dragRef.current.offsetX;
      const newY = e.clientY - dragRef.current.offsetY;
      posRef.current = { x: newX, y: newY };
      setPos({ x: newX, y: newY });
    }

    function onMouseUp() {
      if (!dragRef.current.isDragging) return;
      const elapsed = Date.now() - dragRef.current.startTime;
      const wasDragged = dragRef.current.hasMoved;

      dragRef.current.isDragging = false;
      dragRef.current.hasMoved = false;

      if (!wasDragged && elapsed < DRAG_CLICK_THRESHOLD_MS) {
        const { stats: s } = usePetStore.getState();
        usePetStore.setState({
          stats: { ...s, mood: Math.min(100, s.mood + 3) },
          currentAnimation: "idle",
        });
        scheduleNextBehavior();
      } else if (wasDragged) {
        fallingRef.current = true;
        velYRef.current = 2;
      }
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onPetMessage, scheduleNextBehavior]);

  const tick = useCallback((deltaMs: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    if (deltaMs > 0 && !dragRef.current.isDragging) {
      const { stats: s } = usePetStore.getState();
      const newStats = applyStatDecay(s, deltaMs);
      const changed =
        Math.abs(newStats.hunger - s.hunger) >= 0.01 ||
        Math.abs(newStats.mood - s.mood) >= 0.01 ||
        Math.abs(newStats.energy - s.energy) >= 0.01;
      if (changed) updateStats(newStats);
    }

    // 중력 낙하
    if (fallingRef.current && !dragRef.current.isDragging) {
      const floorY = window.innerHeight - FLOOR_MARGIN;

      velYRef.current += GRAVITY;
      const nextY = posRef.current.y + velYRef.current;

      if (nextY >= floorY) {
        posRef.current = { ...posRef.current, y: floorY };
        setPos({ ...posRef.current });

        const impactVel = Math.abs(velYRef.current);
        velYRef.current = -velYRef.current * BOUNCE_DAMPING;

        if (Math.abs(velYRef.current) < 1.5) {
          fallingRef.current = false;
          velYRef.current = 0;
          usePetStore.setState({ currentAnimation: "idle" });
          scheduleNextBehavior();
        }

        if (impactVel > 3) {
          squashRef.current = { active: true, startTime: performance.now() };
        }
      } else {
        posRef.current = { ...posRef.current, y: nextY };
        setPos({ ...posRef.current });
      }
    }

    // 착지 스쿼시 애니메이션
    if (squashRef.current.active && squashContainerRef.current) {
      const elapsed = performance.now() - squashRef.current.startTime;
      let sx = 1, sy = 1;

      if (elapsed < 80) {
        const p = elapsed / 80;
        sx = 1 + 0.3 * p;
        sy = 1 - 0.3 * p;
      } else if (elapsed < 200) {
        const p = (elapsed - 80) / 120;
        sx = 1.3 - 0.35 * p;
        sy = 0.7 + 0.35 * p;
      } else if (elapsed < 350) {
        const p = (elapsed - 200) / 150;
        sx = 0.95 + 0.05 * p;
        sy = 1.05 - 0.05 * p;
      } else {
        squashRef.current.active = false;
      }

      squashContainerRef.current.style.transform = `scaleX(${sx}) scaleY(${sy})`;
    } else if (squashContainerRef.current && !squashRef.current.active) {
      squashContainerRef.current.style.transform = '';
    }

    // 자율 이동 (walk / run) — 2D
    const behavior = behaviorRef.current;
    if (behavior && (behavior.type === "walk" || behavior.type === "run") && !dragRef.current.isDragging && !fallingRef.current) {
      const speed = behavior.type === "run" ? 2.8 : 1.2;
      const targetX = behavior.targetX ?? posRef.current.x;
      const targetY = behavior.targetY ?? posRef.current.y;
      const dx = targetX - posRef.current.x;
      const dy = targetY - posRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 2) {
        const factor = speed * (deltaMs / 16) / dist;
        const stepX = dx * factor;
        const stepY = dy * factor;
        const newX = Math.max(MARGIN, Math.min(window.innerWidth - MARGIN, posRef.current.x + stepX));
        const newY = Math.max(MARGIN, Math.min(window.innerHeight - MARGIN, posRef.current.y + stepY));
        posRef.current = { x: newX, y: newY };
        setPos({ x: newX, y: newY });

        const goLeft = dx < 0;
        if (goLeft !== facingLeftRef.current) {
          facingLeftRef.current = goLeft;
          setFacingLeft(goLeft);
        }
      }
    }

    const { currentAnimation: anim, currentEmotion: emo, characterType: ct } = usePetStore.getState();
    renderPet(ctx, emo, anim, deltaMs, CANVAS_LOGICAL_SIZE, cursorPosRef.current, facingLeftRef.current, ct);
  }, [updateStats, scheduleNextBehavior]);

  useGameLoop(tick, isVisible && isOnboarded);

  useEffect(() => {
    if (isOnboarded) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    renderPet(ctx, "neutral", "idle", 16, CANVAS_LOGICAL_SIZE);
  }, [isOnboarded]);

  // 호버 대화 (마우스 포인터를 갖다대면 대화)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    function onGlobalMouseMove(e: MouseEvent) {
      if (!isOnboarded) return;
      const { x, y } = posRef.current;
      const relX = e.clientX - x;
      const relY = e.clientY - y;
      cursorPosRef.current = { x: relX, y: relY };

      const dist = Math.sqrt(relX * relX + relY * relY);
      if (dist < 70) {
        if (!hoverTimerRef.current) {
          hoverTimerRef.current = setTimeout(() => {
            const now = Date.now();
            if (!dragRef.current.isDragging && !fallingRef.current && now - lastHoverMsgRef.current > HOVER_MSG_COOLDOWN) {
              const { currentEmotion: emo, stats: s, characterType: ct, userOccupation: occ } = usePetStore.getState();
              const hour = new Date().getHours();
              const msg = getHoverMessage(emo, s, hour, ct, occ);
              onPetMessage(msg, 3500);
              lastHoverMsgRef.current = now;
              usePetStore.getState().setChatTime(now);
            }
            hoverTimerRef.current = null;
          }, 1500);
        }
      } else {
        if (hoverTimerRef.current) {
          clearTimeout(hoverTimerRef.current);
          hoverTimerRef.current = null;
        }
      }
    }

    window.addEventListener("mousemove", onGlobalMouseMove);
    return () => {
      window.removeEventListener("mousemove", onGlobalMouseMove);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, [isOnboarded, onPetMessage]);

  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    if (behaviorTimerRef.current) {
      clearTimeout(behaviorTimerRef.current);
      behaviorTimerRef.current = null;
    }
    behaviorRef.current = null;
    fallingRef.current = false;
    velYRef.current = 0;

    const offsetX = e.clientX - posRef.current.x;
    const offsetY = e.clientY - posRef.current.y;

    dragRef.current = {
      isDragging: true,
      offsetX,
      offsetY,
      startTime: Date.now(),
      hasMoved: false,
    };

    usePetStore.setState({ currentAnimation: "drag" });
    onPetMessage(getDragMessage(usePetStore.getState().characterType));
  }

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      data-pet-character=""
      style={{
        position: "fixed",
        left: pos.x - PET_CANVAS_SIZE / 2,
        top: pos.y - PET_CANVAS_SIZE / 2,
        width: PET_CANVAS_SIZE,
        cursor: "grab",
        userSelect: "none",
        zIndex: 10,
      }}
    >
      <div ref={squashContainerRef} style={{ transformOrigin: 'center bottom' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_LOGICAL_SIZE}
          height={CANVAS_LOGICAL_SIZE}
          className="pixel-art"
          style={{ width: PET_CANVAS_SIZE, height: PET_CANVAS_SIZE, display: "block" }}
          aria-label="데스크탑 펫"
        />
      </div>
      {isOnboarded && petName && (
        <div
          style={{
            textAlign: "center",
            fontSize: 11,
            fontWeight: 600,
            color: "#94a3b8",
            marginTop: 2,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {petName}
        </div>
      )}
    </div>
  );
}

export function PetCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isVisible = useVisibility();

  const {
    stats,
    currentEmotion,
    currentAnimation,
    lastSavedAt,
    isOnboarded,
    updateStats,
  } = usePetStore();

  useEffect(() => {
    if (!isOnboarded || !isVisible) return;
    const elapsed = calculateOfflineElapsed(lastSavedAt, Date.now());
    if (elapsed > 1000) {
      const newStats = applyOfflineDecay(stats, elapsed);
      updateStats(newStats);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, isOnboarded]);

  const tick = useCallback((deltaMs: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    if (deltaMs > 0) {
      const newStats = applyStatDecay(stats, deltaMs);
      const changed =
        Math.abs(newStats.hunger - stats.hunger) >= 0.01 ||
        Math.abs(newStats.mood - stats.mood) >= 0.01 ||
        Math.abs(newStats.energy - stats.energy) >= 0.01;
      if (changed) updateStats(newStats);
    }
    renderPet(ctx, currentEmotion, currentAnimation, deltaMs, CANVAS_LOGICAL_SIZE);
  }, [stats, currentEmotion, currentAnimation, updateStats]);

  useGameLoop(tick, isVisible && isOnboarded);

  useEffect(() => {
    if (isOnboarded) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    renderPet(ctx, "neutral", "idle", 16, CANVAS_LOGICAL_SIZE);
  }, [isOnboarded]);

  return (
    <div className="flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={CANVAS_LOGICAL_SIZE}
        height={CANVAS_LOGICAL_SIZE}
        className="pixel-art"
        style={{ width: 200, height: 200 }}
        aria-label="데스크탑 펫"
      />
    </div>
  );
}
