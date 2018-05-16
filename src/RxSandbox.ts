import { SubscriptionLog } from 'rxjs/internal/testing/SubscriptionLog';
import { TestMessage } from './message/TestMessage';
import { RxSandboxInstance } from './RxSandboxInstance';

export interface RxSandbox {
  /**
   * Creates new instance of test scheduler for testing observables.
   *
   * @param {boolean} [autoFlush] Flush scheduler automatically when `getMarbles` is being called. False by default.
   * @param {number} [frameTimeFactor] Custom frametime factor for virtual time frame. 1 by default.
   * @param {number} [maxFrameValue] Maximum frame value of marble diagram can be read.
   * If marble has value over max frame, it'll be ignored when scheduler flushes out.
   * 1000 * frameTimeFactory by default.
   * @return {RxSandboxInstance} instance of test scheduler interfaces.
   */
  create(autoFlush?: boolean, frameTimeFactor?: number, maxFrameValue?: number): RxSandboxInstance;
  /**
   * Utility assertion method to assert marble based observable test messages.
   * By default return values of sandbox functions are plain object works with
   * any testing framework or assertion library, while this assertion provides
   * better visualization against observable test messages.
   *
   */
  marbleAssert<T = string>(
    source: Array<TestMessage<T | Array<TestMessage<T>>>> | Readonly<Array<TestMessage<T | Array<TestMessage<T>>>>>
  ): {
    to: {
      equal(
        expected:
          | Array<TestMessage<T | Array<TestMessage<T>>>>
          | Readonly<Array<TestMessage<T | Array<TestMessage<T>>>>>
      ): void;
    };
  };
  marbleAssert(source: Array<SubscriptionLog>): { to: { equal(expected: Array<SubscriptionLog>): void } };
}
