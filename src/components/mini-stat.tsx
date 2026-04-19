'use client';

import { useState } from "react";
import { usePetStore } from "@/stores/pet-store";

function getBarColor(value: number): string {
  if (value >= 70) return "#4ade80";
  if (value >= 40) return "#facc15";
  if (value >= 20) return "#fb923c";
  return "#f87171";
}

function getIconColor(value: number): string {
  if (value >= 70) return "#22c55e";
  if (value >= 40) return "#eab308";
  if (value >= 20) return "#f97316";
  return "#ef4444";
}

interface StatIconProps {
  icon: string;
  label: string;
  value: number;
  isExpanded: boolean;
}

function StatIcon({ icon, label, value, isExpanded }: StatIconProps) {
  const color = getIconColor(value);
  const barColor = getBarColor(value);
  const isDanger = value < 30;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: isExpanded ? 140 : "auto" }}>
      <span
        style={{
          fontSize: 20,
          animation: isDanger ? "blink 1s ease-in-out infinite" : undefined,
          filter: isDanger ? "drop-shadow(0 0 3px red)" : undefined,
        }}
      >
        {icon}
      </span>
      {isExpanded && (
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>{label}</span>
            <span style={{ fontSize: 10, color: "#94a3b8", fontVariantNumeric: "tabular-nums" }}>
              {Math.round(value)}
            </span>
          </div>
          <div style={{ width: 100, height: 6, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
            <div
              style={{
                width: `${Math.max(0, Math.min(100, value))}%`,
                height: "100%",
                background: barColor,
                borderRadius: 4,
                transition: "width 0.5s ease, background 0.5s ease",
              }}
              role="progressbar"
              aria-valuenow={Math.round(value)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={label}
            />
          </div>
        </div>
      )}
      {!isExpanded && (
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: color,
            boxShadow: isDanger ? `0 0 6px ${color}` : undefined,
          }}
        />
      )}
    </div>
  );
}

export function MiniStat() {
  const [isExpanded, setIsExpanded] = useState(false);
  const stats = usePetStore((s) => s.stats);

  return (
    <>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
      <div
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        onClick={() => setIsExpanded((v) => !v)}
        style={{
          position: "fixed",
          bottom: 24,
          left: 20,
          zIndex: 30,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(8px)",
          borderRadius: 16,
          padding: isExpanded ? "12px 16px" : "10px 12px",
          boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
          border: "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          cursor: "pointer",
          transition: "all 0.2s ease",
          userSelect: "none",
        }}
      >
        <StatIcon icon="🍖" label="배고픔" value={stats.hunger} isExpanded={isExpanded} />
        <StatIcon icon="😊" label="기분" value={stats.mood} isExpanded={isExpanded} />
        <StatIcon icon="⚡" label="에너지" value={stats.energy} isExpanded={isExpanded} />
      </div>
    </>
  );
}
