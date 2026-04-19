'use client';

import { useEffect, useState, useRef } from "react";

interface FloatingSpeechBubbleProps {
  message: string | null;
  visible: boolean;
  petX: number;
  petY: number;
}

export function FloatingSpeechBubble({ message, visible, petX, petY }: FloatingSpeechBubbleProps) {
  const [displayMsg, setDisplayMsg] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const prevMsgRef = useRef<string | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible && message) {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      setDisplayMsg(message);
      requestAnimationFrame(() => setShow(true));
      prevMsgRef.current = message;
    } else if (!visible) {
      setShow(false);
      fadeTimerRef.current = setTimeout(() => setDisplayMsg(null), 400);
    }
  }, [visible, message]);

  if (!displayMsg) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: petX,
        top: petY - 60,
        transform: "translateX(-50%)",
        zIndex: 20,
        pointerEvents: "none",
        transition: "left 0.15s ease, top 0.15s ease",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: "8px 14px",
          fontSize: 13,
          fontWeight: 600,
          color: "#334155",
          whiteSpace: "nowrap",
          boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
          opacity: show ? 1 : 0,
          transform: show ? "scale(1)" : "scale(0.85)",
          transition: "opacity 0.35s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {displayMsg}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "100%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "7px solid transparent",
            borderRight: "7px solid transparent",
            borderTop: "7px solid white",
            filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.06))",
          }}
        />
      </div>
    </div>
  );
}
