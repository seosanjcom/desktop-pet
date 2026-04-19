export type TickCallback = (deltaTime: number) => void;

export class GameLoop {
  private rafId: number | null = null;
  private lastTime: number | null = null;
  private callback: TickCallback;
  private _isRunning = false;

  constructor(callback: TickCallback) {
    this.callback = callback;
  }

  get isRunning(): boolean {
    return this._isRunning;
  }

  start(): void {
    if (this._isRunning) return;
    this._isRunning = true;
    this.lastTime = null;
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    if (!this._isRunning) return;
    this._isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.lastTime = null;
  }

  private tick = (timestamp: number): void => {
    if (!this._isRunning) return;

    const deltaTime = this.lastTime !== null
      ? Math.min(timestamp - this.lastTime, 1000) // 최대 1초 deltaTime (탭 전환 등 방지)
      : 0;

    this.lastTime = timestamp;
    this.callback(deltaTime);

    this.rafId = requestAnimationFrame(this.tick);
  };
}
