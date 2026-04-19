import { clampStat } from "@/lib/time-utils";
import { STAT_DECAY_PER_MINUTE } from "@/lib/constants";
import type { PetStats } from "@/types/pet";

export function applyStatDecay(stats: PetStats, deltaMs: number): PetStats {
  const elapsedMinutes = deltaMs / (60 * 1000);
  const decay = elapsedMinutes * STAT_DECAY_PER_MINUTE;

  return {
    hunger: clampStat(stats.hunger - decay),
    mood: clampStat(stats.mood - decay),
    energy: clampStat(stats.energy - decay),
  };
}
