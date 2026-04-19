'use client';

import { useEffect, useRef } from "react";
import { GameLoop } from "@/engine/game-loop";

export function useGameLoop(
  callback: (deltaTime: number) => void,
  isRunning: boolean
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const loop = new GameLoop((dt) => callbackRef.current(dt));

    if (isRunning) {
      loop.start();
    }

    return () => {
      loop.stop();
    };
  }, [isRunning]);
}
