import { VirtualTimeScheduler } from 'rxjs/scheduler/VirtualTimeScheduler';

/**
 * Configuration options for scheduler instance.
 *
 */
export interface SchedulerStartOptions {
  /**
   * Represents virtual time when scheduler instance is created, start to watch observables
   */
  created: number;

  subscribed: number;
  unsubscribed: number;
}

/**
 * Exposes interfaces to control scheduler runs based on virtual time frame,
 * allows to assert / inspect observables synchronously
 *
 */
export interface VirtualTestScheduler extends VirtualTimeScheduler {
  readonly isFlushing: boolean;
}
