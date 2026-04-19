import type { PetEmotion, AnimationName } from "@/types/pet";
import type { CursorPos } from "@/engine/sprite-renderer";

export interface CharacterRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    emotion: PetEmotion,
    animation: AnimationName,
    deltaMs: number,
    canvasSize: number,
    cursorPos?: CursorPos | null,
    facingLeft?: boolean
  ): void;
}

export { OrangutanRenderer } from "./orangutan";
export { CatRenderer } from "./cat";
export { PenguinRenderer } from "./penguin";
export { HamsterRenderer } from "./hamster";
