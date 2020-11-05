import { TestMessage } from '../message/TestMessage';
import { SubscriptionLog } from '../utils/coreInternalImport';
import { RxAsyncSandboxInstance } from './RxAsyncSandboxInstance';
import { RxSandboxInstance } from './RxSandboxInstance';
import { AsyncFlushSandboxOption, SandboxOption } from './SandboxOption';

export interface RxSandbox {
  /**
   * Creates new instance of test scheduler for testing observables.
   *
   * @param {SandboxOptions} [options] customizable options to create test scheduler.
   * @return {RxSandboxInstance} instance of test scheduler interfaces.
   */
  create(autoFlush?: boolean, frameTimeFactor?: number, maxFrameValue?: number): RxSandboxInstance;
  create(options: AsyncFlushSandboxOption): RxAsyncSandboxInstance;
  create(options?: Partial<SandboxOption>): RxSandboxInstance;
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
