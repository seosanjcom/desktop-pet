import { clampStat, calculateOfflineDecay } from "@/lib/time-utils";
import { OFFLINE_CAP_HOURS, STAT_DECAY_PER_MINUTE } from "@/lib/constants";
import type { PetStats } from "@/types/pet";

export function calculateOfflineElapsed(lastSavedAt: number, now: number): number {
  const elapsed = now - lastSavedAt;
  if (elapsed <= 0) return 0;
  return Math.min(elapsed, OFFLINE_CAP_HOURS * 60 * 60 * 1000);
}

export function applyOfflineDecay(stats: PetStats, elapsedMs: number): PetStats {
  const decay = calculateOfflineDecay(elapsedMs, STAT_DECAY_PER_MINUTE);
  return {
    hunger: clampStat(stats.hunger - decay),
    mood: clampStat(stats.mood - decay),
    energy: clampStat(stats.energy - decay),
  };
}
