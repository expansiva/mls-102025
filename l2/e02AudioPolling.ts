/// <mls fileReference="_102025_/l2/e02AudioPolling.ts" enhancement="_blank" />

export interface E02AudioPollScheduler {
  schedule(callback: () => void, delayMs: number): unknown;
  cancel(token: unknown): void;
}

const browserScheduler: E02AudioPollScheduler = {
  schedule: (callback, delayMs) => setTimeout(callback, delayMs),
  cancel: token => clearTimeout(token as ReturnType<typeof setTimeout>),
};

/** One bounded polling chain. Calling start twice never replenishes its budget. */
export class E02AudioPollingSession {
  private timer?: unknown;
  private running = false;
  private generation = 0;
  private remaining: number;

  constructor(
    maxPolls: number,
    private readonly delayMs: number,
    private readonly poll: () => Promise<boolean>,
    private readonly scheduler: E02AudioPollScheduler = browserScheduler,
  ) {
    this.remaining = Math.max(0, Math.floor(maxPolls));
  }

  get active(): boolean { return this.running; }
  get pollsRemaining(): number { return this.remaining; }

  start(): void {
    if (this.running || this.remaining <= 0) return;
    this.running = true;
    this.scheduleNext();
  }

  stop(): void {
    this.running = false;
    this.generation++;
    if (this.timer !== undefined) this.scheduler.cancel(this.timer);
    this.timer = undefined;
  }

  private scheduleNext(): void {
    if (!this.running || this.remaining <= 0) { this.stop(); return; }
    const generation = this.generation;
    this.timer = this.scheduler.schedule(() => void this.tick(generation), this.delayMs);
  }

  private async tick(generation: number): Promise<void> {
    this.timer = undefined;
    if (!this.running || generation !== this.generation || this.remaining <= 0) return;
    this.remaining--;
    const continuePolling = await this.poll();
    if (!this.running || generation !== this.generation || !continuePolling || this.remaining <= 0) {
      this.stop();
      return;
    }
    this.scheduleNext();
  }
}
