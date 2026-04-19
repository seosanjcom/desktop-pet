import { STAT_MIN, STAT_MAX, OFFLINE_CAP_HOURS } from "@/lib/constants";

export function clampStat(value: number): number {
  return Math.max(STAT_MIN, Math.min(STAT_MAX, value));
}

export function calculateOfflineDecay(
  elapsedMs: number,
  decayPerMinute: number
): number {
  if (elapsedMs <= 0) return 0;

  const cappedMs = Math.min(elapsedMs, OFFLINE_CAP_HOURS * 60 * 60 * 1000);
  const elapsedMinutes = cappedMs / (60 * 1000);
  return elapsedMinutes * decayPerMinute;
}
