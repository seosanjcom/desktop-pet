export interface SpriteFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpriteAnimation {
  name: string;
  frames: SpriteFrame[];
  frameRate: number; // frames per second
  loop: boolean;
}

export interface SpriteSheetData {
  imageUrl: string;
  frameWidth: number;
  frameHeight: number;
  animations: Record<string, SpriteAnimation>;
}
