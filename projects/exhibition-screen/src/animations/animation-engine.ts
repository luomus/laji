export class AnimationEngine {
  private playing = false;
  private lastLoop: DOMHighResTimeStamp;

  constructor(private initFn: () => void, private updateFn: (dt: number) => boolean, private destroyFn: () => void) {}

  public play() {
    if (this.playing) { return; }
    this.lastLoop = performance.now();
    this.playing = true;
    this.initFn();
    window.requestAnimationFrame(this.loop.bind(this));
  }

  public isPlaying(): boolean {
    return this.playing;
  }

  private loop() {
    const now = performance.now();
    const dt = (now - this.lastLoop) / 1000;
    const s = this.updateFn(dt);

    if (!s) {
      this.destroyFn();
      this.playing = false;
      return;
    }

    this.lastLoop = now;
    window.requestAnimationFrame(this.loop.bind(this));
  }
}
