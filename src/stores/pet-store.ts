import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PetState, PetStats, CharacterType, UserOccupation } from "@/types/pet";
import { feedPet, playWithPet, sleepPet } from "@/systems/action-system";
import { determineEmotion } from "@/systems/emotion-system";

interface PetStoreState extends PetState {
  lastChatTime: number;
  lastActionTime: number;
  createPet: (petName: string, userName: string, characterType?: CharacterType, occupation?: UserOccupation) => void;
  feed: () => void;
  play: () => void;
  sleep: () => void;
  updateStats: (stats: PetStats) => void;
  changeCharacter: (type: CharacterType) => void;
  renamePet: (name: string) => void;
  renameUser: (name: string) => void;
  changeOccupation: (occupation: UserOccupation) => void;
  resetPet: () => void;
  setChatTime: (t: number) => void;
  setActionTime: (t: number) => void;
}

const defaultPetState: PetState = {
  version: 1,
  petName: "",
  userName: "",
  characterType: "orangutan",
  userOccupation: "other",
  createdAt: 0,
  lastSavedAt: 0,
  stats: { hunger: 100, mood: 100, energy: 100 },
  currentEmotion: "neutral",
  currentAnimation: "idle",
  isOnboarded: false,
};

const defaultChatState = {
  lastChatTime: 0,
  lastActionTime: 0,
};

function withEmotionUpdate(stats: PetStats): Partial<PetState> {
  return {
    stats,
    currentEmotion: determineEmotion(stats),
    lastSavedAt: Date.now(),
  };
}

export const usePetStore = create<PetStoreState>()(
  persist(
    (set) => ({
      ...defaultPetState,
      ...defaultChatState,

      createPet: (petName: string, userName: string, characterType: CharacterType = "orangutan", occupation: UserOccupation = "other") => {
        const now = Date.now();
        const stats = { hunger: 100, mood: 100, energy: 100 };
        set({
          petName,
          userName,
          characterType,
          userOccupation: occupation,
          createdAt: now,
          lastSavedAt: now,
          stats,
          currentEmotion: determineEmotion(stats),
          currentAnimation: "idle",
          isOnboarded: true,
        });
      },

      feed: () =>
        set((state) => ({
          ...withEmotionUpdate(feedPet(state.stats)),
          currentAnimation: "eat",
          lastActionTime: Date.now(),
        })),

      play: () =>
        set((state) => ({
          ...withEmotionUpdate(playWithPet(state.stats)),
          currentAnimation: "play",
          lastActionTime: Date.now(),
        })),

      sleep: () =>
        set((state) => ({
          ...withEmotionUpdate(sleepPet(state.stats)),
          currentAnimation: "sleep",
          lastActionTime: Date.now(),
        })),

      changeCharacter: (type: CharacterType) =>
        set({ characterType: type }),

      renamePet: (name: string) =>
        set({ petName: name }),

      renameUser: (name: string) =>
        set({ userName: name }),

      changeOccupation: (occupation: UserOccupation) =>
        set({ userOccupation: occupation }),

      updateStats: (stats: PetStats) =>
        set(() => withEmotionUpdate(stats)),

      resetPet: () =>
        set({ ...defaultPetState, ...defaultChatState }),

      setChatTime: (t: number) => set({ lastChatTime: t }),
      setActionTime: (t: number) => set({ lastActionTime: t }),
    }),
    {
      name: "desktop-pet-v1",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
