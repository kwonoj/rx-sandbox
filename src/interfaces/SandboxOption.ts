/**
 * Options to create test scheduler.
 */
interface SandboxOption {
  /**
   * Flush scheduler automatically when `getMarbles` is being called. False by default.
   */
  autoFlush: boolean;
  /**
   * Custom frametime factor for virtual time frame. 1 by default.
   */
  frameTimeFactor: number;
  /**
   * Maximum frame value of marble diagram can be read.
   * If marble has value over max frame, it'll be ignored when scheduler flushes out.
   * 1000 * frameTimeFactory by default.
   */
  maxFrameValue: number;
}

interface AsyncFlushSandboxOption extends Partial<SandboxOption> {
  /**
   * Scheduling each actions into next available tick when flush
   * along with native promises chained in inner observables.
   *
   * Scheduler's flush will no longer resolve synchronously.
   */
  flushWithAsyncTick: true;
}

export { SandboxOption, AsyncFlushSandboxOption };
