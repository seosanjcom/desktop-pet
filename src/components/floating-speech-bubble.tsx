'use client';

import { useEffect, useState, useRef } from "react";

interface FloatingSpeechBubbleProps {
  message: string | null;
  visible: boolean;
  petX: number;
  petY: number;
}

export function FloatingSpeechBubble({ message, visible, petX, petY }: FloatingSpeechBubbleProps) {
  const [isNew, setIsNew] = useState(false);
  const prevMsgRef = useRef<string | null>(null);

  useEffect(() => {
    if (message && message !== prevMsgRef.current) {
      setIsNew(true);
      prevMsgRef.current = message;
      const t = setTimeout(() => setIsNew(false), 300);
      return () => clearTimeout(t);
    }
  }, [message]);

  if (!visible || !message) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: petX,
        top: petY - 60,
        transform: "translateX(-50%)",
        zIndex: 20,
        pointerEvents: "none",
        animation: isNew ? "bubbleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)" : undefined,
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
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        {message}
        {/* 말풍선 꼬리 */}
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

      <style>{`
        @keyframes bubbleIn {
          from { transform: translateX(-50%) scale(0.6); opacity: 0; }
          to   { transform: translateX(-50%) scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}
