import { TestMessage } from '../message/TestMessage';
import { AsyncSchedulerInstance, SchedulerInstance } from '../scheduler/createTestScheduler';
import { SubscriptionLog } from '../utils/coreInternalImport';

/**
 * Sandbox instance with test scheduler. All actions scheduled via scheduler
 * will be flushed synchronously.
 */
interface RxSandboxInstance extends SchedulerInstance {
  e: expectedObservable;
  /**
   * Utility function to generate `expected` subscriptions via marble diagram.
   */
  s: expectedSubscription;
}

/**
 *
 * Sandbox instance with test scheduler.
 * Scheduler will schedule actions into native async `tick`, trying to resolve any
 * native async functions in innerobservables.
 *
 * Scheduler will no longer flush actions synchronously in result.
 *
 * @experimental Not a final implementation. Either interface or implementation can change
 * without major breaking version bump.
 */
interface RxAsyncSandboxInstance extends AsyncSchedulerInstance {
  e: expectedObservable;
  /**
   * Utility function to generate `expected` subscriptions via marble diagram.
   */
  s: expectedSubscription;
}

type expectedObservable = <T = string>(
  marble: string,
  value?: { [key: string]: T } | null,
  error?: any
) => Readonly<Array<TestMessage<T | Array<TestMessage<T>>>>>;
type expectedSubscription = (marble: string) => SubscriptionLog;

export {
  expectedObservable,
  expectedSubscription,
  RxSandboxInstance,
  RxAsyncSandboxInstance
};
