'use client';

import { useState, useCallback } from "react";
import { usePetStore } from "@/stores/pet-store";

interface FloatingText {
  id: number;
  text: string;
  x: number;
}

interface ActionButtonProps {
  icon: string;
  label: string;
  disabled: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

function ActionButton({ icon, label, disabled, onClick }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`action-btn flex flex-col items-center gap-1 px-4 py-3 rounded-2xl font-semibold text-white text-sm min-w-[72px] ${
        disabled
          ? "bg-slate-300 cursor-not-allowed opacity-60"
          : "bg-gradient-to-b from-sky-400 to-blue-500 shadow-md shadow-blue-200 cursor-pointer"
      }`}
      aria-label={label}
    >
      <span className="text-2xl">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

let floatIdCounter = 0;

export function ActionBar() {
  const { feed, play, sleep, currentAnimation } = usePetStore();
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  const isAnimating =
    currentAnimation === "eat" ||
    currentAnimation === "play" ||
    currentAnimation === "sleep";

  const addFloatText = useCallback((text: string, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
    const id = floatIdCounter++;
    const x = rect.left + rect.width / 2;
    setFloatingTexts((prev) => [...prev, { id, text, x }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((ft) => ft.id !== id));
    }, 1000);
  }, []);

  const handleFeed = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    feed();
    addFloatText("+20 배고픔", e);
    // 1.5초 후 idle 복귀
    setTimeout(() => {
      usePetStore.setState({ currentAnimation: "idle" });
    }, 1500);
  }, [feed, addFloatText]);

  const handlePlay = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    play();
    addFloatText("+20 기분", e);
    setTimeout(() => {
      usePetStore.setState({ currentAnimation: "idle" });
    }, 2000);
  }, [play, addFloatText]);

  const handleSleep = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    sleep();
    addFloatText("+25 에너지", e);
    setTimeout(() => {
      usePetStore.setState({ currentAnimation: "idle" });
    }, 2500);
  }, [sleep, addFloatText]);

  return (
    <div className="relative flex justify-center gap-3 w-full">
      {floatingTexts.map((ft) => (
        <span
          key={ft.id}
          className="float-text fixed z-50 text-sm font-bold text-emerald-500 pointer-events-none whitespace-nowrap"
          style={{ left: ft.x, top: "50%" }}
        >
          {ft.text}
        </span>
      ))}

      <ActionButton
        icon="🍖"
        label="밥주기"
        disabled={isAnimating}
        onClick={handleFeed}
      />
      <ActionButton
        icon="🎾"
        label="놀아주기"
        disabled={isAnimating}
        onClick={handlePlay}
      />
      <ActionButton
        icon="💤"
        label="재우기"
        disabled={isAnimating}
        onClick={handleSleep}
      />
    </div>
  );
}
