'use client';

import { useState, useCallback } from "react";
import { usePetStore } from "@/stores/pet-store";
import { getActionMessage } from "@/systems/chat-system";

interface MiniActionButtonProps {
  icon: string;
  label: string;
  disabled: boolean;
  onClick: () => void;
  isExpanded: boolean;
}

function MiniActionButton({ icon, label, disabled, onClick, isExpanded }: MiniActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      style={{
        display: "flex",
        alignItems: "center",
        gap: isExpanded ? 8 : 0,
        width: isExpanded ? "auto" : 40,
        height: 40,
        padding: isExpanded ? "0 14px 0 10px" : "0",
        justifyContent: "center",
        background: disabled
          ? "rgba(148,163,184,0.5)"
          : "linear-gradient(135deg, #fb923c, #f97316)",
        border: "none",
        borderRadius: 20,
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: 18,
        color: "white",
        boxShadow: disabled ? "none" : "0 2px 8px rgba(249,115,22,0.35)",
        transition: "all 0.2s ease",
        opacity: disabled ? 0.6 : 1,
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
      aria-label={label}
    >
      <span>{icon}</span>
      {isExpanded && (
        <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
      )}
    </button>
  );
}

interface MiniActionsProps {
  onAction: (msg: string) => void;
}

export function MiniActions({ onAction }: MiniActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { feed, play, sleep, currentAnimation } = usePetStore();

  const isAnimating =
    currentAnimation === "eat" ||
    currentAnimation === "play" ||
    currentAnimation === "sleep";

  const ct = usePetStore((s) => s.characterType);

  const handleFeed = useCallback(() => {
    if (isAnimating) return;
    feed();
    onAction(getActionMessage("feed", ct));
    setTimeout(() => usePetStore.setState({ currentAnimation: "idle" }), 1500);
  }, [feed, isAnimating, onAction, ct]);

  const handlePlay = useCallback(() => {
    if (isAnimating) return;
    play();
    onAction(getActionMessage("play", ct));
    setTimeout(() => usePetStore.setState({ currentAnimation: "idle" }), 2000);
  }, [play, isAnimating, onAction, ct]);

  const handleSleep = useCallback(() => {
    if (isAnimating) return;
    sleep();
    onAction(getActionMessage("sleep", ct));
    setTimeout(() => usePetStore.setState({ currentAnimation: "idle" }), 2500);
  }, [sleep, isAnimating, onAction, ct]);

  return (
    <div
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      style={{
        position: "fixed",
        bottom: 24,
        right: 20,
        zIndex: 30,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        alignItems: "flex-end",
      }}
    >
      <MiniActionButton
        icon="🍖"
        label="밥주기"
        disabled={isAnimating}
        onClick={handleFeed}
        isExpanded={isExpanded}
      />
      <MiniActionButton
        icon="🎾"
        label="놀아주기"
        disabled={isAnimating}
        onClick={handlePlay}
        isExpanded={isExpanded}
      />
      <MiniActionButton
        icon="💤"
        label="재우기"
        disabled={isAnimating}
        onClick={handleSleep}
        isExpanded={isExpanded}
      />
    </div>
  );
}
