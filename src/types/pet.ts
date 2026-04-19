export type PetEmotion = 'happy' | 'neutral' | 'sad' | 'angry' | 'sleepy';

export type CharacterType = 'orangutan' | 'cat' | 'penguin' | 'hamster';

export type UserOccupation =
  | 'student'
  | 'office'
  | 'freelancer'
  | 'selfEmployed'
  | 'homemaker'
  | 'jobSeeker'
  | 'other';

export const OCCUPATION_INFO: Record<UserOccupation, { label: string; emoji: string }> = {
  student: { label: '학생', emoji: '📚' },
  office: { label: '직장인', emoji: '💼' },
  freelancer: { label: '프리랜서', emoji: '💻' },
  selfEmployed: { label: '자영업', emoji: '🏪' },
  homemaker: { label: '주부', emoji: '🏠' },
  jobSeeker: { label: '취준생', emoji: '📝' },
  other: { label: '기타', emoji: '✨' },
};

export const CHARACTER_INFO: Record<CharacterType, {
  name: string;
  description: string;
  color: string;
}> = {
  orangutan: { name: '우탄이', description: '포근한 오랑우탄 인형', color: '#8B4513' },
  cat: { name: '킹냥이', description: '근육질 고양이', color: '#f97316' },
  penguin: { name: '펭이', description: '뒤뚱뒤뚱 펭귄', color: '#1e293b' },
  hamster: { name: '햄찌', description: '볼빵빵 햄스터', color: '#F5DEB3' },
};

export type AnimationName =
  | 'idle'
  | 'walk'
  | 'run'
  | 'eat'
  | 'play'
  | 'sleep'
  | 'angry'
  | 'sit'
  | 'groom'
  | 'yawn'
  | 'lie'
  | 'drag';

export type BehaviorType = 'walk' | 'idle' | 'sit' | 'groom' | 'yawn' | 'lie' | 'play' | 'run';

export interface Behavior {
  type: BehaviorType;
  duration: number;
  targetX?: number;
  targetY?: number;
}

export interface PetStats {
  hunger: number;  // 0~100
  mood: number;    // 0~100
  energy: number;  // 0~100
}

export interface PetState {
  version: 1;
  petName: string;
  userName: string;
  characterType: CharacterType;
  userOccupation: UserOccupation;
  createdAt: number;
  lastSavedAt: number;
  stats: PetStats;
  currentEmotion: PetEmotion;
  currentAnimation: AnimationName;
  isOnboarded: boolean;
}
