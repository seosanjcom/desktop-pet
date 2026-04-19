'use client';

import { useState, useCallback, useRef } from "react";
import { usePetStore } from "@/stores/pet-store";
import { getActionMessage, getChatResponse } from "@/systems/chat-system";

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
  const [chatOpen, setChatOpen] = useState(false);
  const [chatText, setChatText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { feed, play, sleep, currentAnimation } = usePetStore();

  const isAnimating =
    currentAnimation === "eat" ||
    currentAnimation === "play" ||
    currentAnimation === "sleep";

  const ct = usePetStore((s) => s.characterType);
  const occ = usePetStore((s) => s.userOccupation);

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

  const handleChatToggle = useCallback(() => {
    setChatOpen((prev) => {
      if (!prev) setTimeout(() => inputRef.current?.focus(), 50);
      return !prev;
    });
  }, []);

  const handleChatSubmit = useCallback(() => {
    const trimmed = chatText.trim();
    if (!trimmed) return;
    const response = getChatResponse(trimmed, ct, occ);
    onAction(response);
    setChatText("");
    setChatOpen(false);
  }, [chatText, ct, occ, onAction]);

  return (
    <div
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => { setIsExpanded(false); setChatOpen(false); }}
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
      {chatOpen && (
        <div
          style={{
            display: "flex",
            gap: 6,
            alignItems: "center",
            background: "rgba(255,255,255,0.95)",
            borderRadius: 20,
            padding: "4px 6px 4px 14px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
            animation: "chatSlideIn 0.25s ease",
          }}
        >
          <input
            ref={inputRef}
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleChatSubmit(); }}
            placeholder="말 걸어보기..."
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 13,
              fontWeight: 500,
              color: "#334155",
              width: 140,
              fontFamily: "inherit",
            }}
          />
          <button
            onClick={handleChatSubmit}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              border: "none",
              background: chatText.trim() ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "rgba(148,163,184,0.3)",
              color: "white",
              fontSize: 14,
              cursor: chatText.trim() ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            aria-label="보내기"
          >
            ➤
          </button>
        </div>
      )}
      <MiniActionButton
        icon="💬"
        label="대화하기"
        disabled={false}
        onClick={handleChatToggle}
        isExpanded={isExpanded}
      />
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
