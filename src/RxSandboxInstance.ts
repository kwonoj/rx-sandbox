import { SubscriptionLog } from 'rxjs/internal/testing/SubscriptionLog';
import { TestMessage } from './message/TestMessage';
import { TestScheduler } from './scheduler/TestScheduler';

type hotObservable = typeof TestScheduler.prototype.createHotObservable;
type coldObservable = typeof TestScheduler.prototype.createColdObservable;
type flushScheduler = typeof TestScheduler.prototype.flush;
type advanceToScheduler = typeof TestScheduler.prototype.advanceTo;
type getObservableMessage = typeof TestScheduler.prototype.getMessages;
type expectedObservable = <T = string>(
  marble: string,
  value?: { [key: string]: T } | null,
  error?: any
) => Readonly<Array<TestMessage<T | Array<TestMessage<T>>>>>;
type expectedSubscription = (marble: string) => SubscriptionLog;

type RxSandboxInstance = {
  /**
   * Test scheduler created for sandbox instance
   */
  scheduler: TestScheduler;
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
};

export {
  hotObservable,
  coldObservable,
  flushScheduler,
  advanceToScheduler,
  getObservableMessage,
  expectedObservable,
  expectedSubscription,
  RxSandboxInstance
};
