import { ANGRY_THRESHOLD, HAPPY_THRESHOLD } from "@/lib/constants";
import type { PetStats, PetEmotion } from "@/types/pet";

export function determineEmotion(stats: PetStats): PetEmotion {
  const { hunger, mood, energy } = stats;

  // 우선순위 1: happy (모든 스탯 >= 70)
  if (hunger >= HAPPY_THRESHOLD && mood >= HAPPY_THRESHOLD && energy >= HAPPY_THRESHOLD) {
    return "happy";
  }

  // 우선순위 2: angry (아무 스탯 < 20)
  if (hunger < ANGRY_THRESHOLD || mood < ANGRY_THRESHOLD || energy < ANGRY_THRESHOLD) {
    return "angry";
  }

  // 우선순위 3: sleepy (energy < 30)
  if (energy < 30) {
    return "sleepy";
  }

  // 우선순위 4: sad (아무 스탯 < 40)
  if (hunger < 40 || mood < 40 || energy < 40) {
    return "sad";
  }

  // 나머지: neutral
  return "neutral";
}
