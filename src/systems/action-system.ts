import { clampStat } from "@/lib/time-utils";
import {
  FEED_HUNGER_AMOUNT,
  PLAY_MOOD_AMOUNT,
  PLAY_ENERGY_COST,
  SLEEP_ENERGY_AMOUNT,
  SLEEP_MOOD_COST,
} from "@/lib/constants";
import type { PetStats } from "@/types/pet";

export function feedPet(stats: PetStats): PetStats {
  return {
    ...stats,
    hunger: clampStat(stats.hunger + FEED_HUNGER_AMOUNT),
  };
}

export function playWithPet(stats: PetStats): PetStats {
  return {
    ...stats,
    mood: clampStat(stats.mood + PLAY_MOOD_AMOUNT),
    energy: clampStat(stats.energy - PLAY_ENERGY_COST),
  };
}

export function sleepPet(stats: PetStats): PetStats {
  return {
    ...stats,
    energy: clampStat(stats.energy + SLEEP_ENERGY_AMOUNT),
    mood: clampStat(stats.mood - SLEEP_MOOD_COST),
  };
}
