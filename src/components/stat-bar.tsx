'use client';

import { usePetStore } from "@/stores/pet-store";

interface StatItemProps {
  label: string;
  icon: string;
  value: number;
}

function getBarColor(value: number): string {
  if (value >= 70) return "bg-green-400";
  if (value >= 40) return "bg-yellow-400";
  if (value >= 20) return "bg-orange-400";
  return "bg-red-500";
}

function StatItem({ label, icon, value }: StatItemProps) {
  const barColor = getBarColor(value);
  const rounded = Math.round(value);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center text-sm font-medium text-slate-600">
        <span className="flex items-center gap-1">
          <span>{icon}</span>
          <span>{label}</span>
        </span>
        <span className="text-slate-400 text-[10px] tabular-nums">{rounded}</span>
      </div>
      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          role="progressbar"
          aria-valuenow={rounded}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        />
      </div>
    </div>
  );
}

export function StatBar() {
  const stats = usePetStore((s) => s.stats);

  return (
    <div className="flex flex-col gap-3 w-full px-2">
      <StatItem label="배고픔" icon="🍖" value={stats.hunger} />
      <StatItem label="기분" icon="😊" value={stats.mood} />
      <StatItem label="에너지" icon="⚡" value={stats.energy} />
    </div>
  );
}
