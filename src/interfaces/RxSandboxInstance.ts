import { SchedulerLike } from 'rxjs';
import { TestMessage } from '../message/TestMessage';
import { createTestScheduler } from '../scheduler/createTestScheduler';
import { SubscriptionLog } from '../utils/coreInternalImport';

type hotObservable = ReturnType<typeof createTestScheduler>['createHotObservable'];
type coldObservable = ReturnType<typeof createTestScheduler>['createColdObservable'];
type flushScheduler = ReturnType<typeof createTestScheduler>['flush'];
type advanceToScheduler = ReturnType<typeof createTestScheduler>['advanceTo'];
type getObservableMessage = ReturnType<typeof createTestScheduler>['getMessages'];
type expectedObservable = <T = string>(
  marble: string,
  value?: { [key: string]: T } | null,
  error?: any
) => Readonly<Array<TestMessage<T | Array<TestMessage<T>>>>>;
type expectedSubscription = (marble: string) => SubscriptionLog;

interface RxSandboxInstance {
  /**
   * Test scheduler created for sandbox instance
   */
  scheduler: SchedulerLike & {
    /**
     * @deprecated: Testscheduler will not expose this property anymore.
     * Use return value from createTestScheduler instead.
     */
    maxFrame: number;
  };
  /**
   * Creates a hot observable using marble diagram DSL, or TestMessage.
   */
  hot: hotObservable;
  /**
   * Creates a cold obsrevable using marbld diagram DSL, or TestMessage.
   */
  cold: coldObservable;
  /**
   * Flush out currently scheduled observables, fill values returned by `getMarbles`.
   */
  flush: flushScheduler;
  /**
   * Flush out currently scheduled observables, only until reaches frame specfied.
   */
  advanceTo: advanceToScheduler;
  /**
   * Get array of observable value's metadata TestMessage<T> from observable
   * created via `hot` or `cold`. Returned array will be filled once scheduler flushes
   * scheduled actions, either via explicit `flush` or implicit `autoFlush`.
   */
  getMessages: getObservableMessage;
  /**
   * Utility function to generate `expected` values via marble diagram.
   */
  e: expectedObservable;
  /**
   * Utility function to generate `expected` subscriptions via marble diagram.
   */
  s: expectedSubscription;

  maxFrame: number;
}

export {
  hotObservable,
  coldObservable,
  flushScheduler,
  advanceToScheduler,
  getObservableMessage,
  expectedObservable,
  expectedSubscription,
  RxSandboxInstance,
};
