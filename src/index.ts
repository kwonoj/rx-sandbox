import { marbleAssert } from './assert/marbleAssert';
import { RxAsyncSandboxInstance, RxSandboxInstance } from './interfaces/RxSandboxInstance';
import { AsyncFlushSandboxOption, SandboxOption } from './interfaces/SandboxOption';
import { parseObservableMarble } from './marbles/parseObservableMarble';
import { parseSubscriptionMarble } from './marbles/parseSubscriptionMarble';
import { TestMessage } from './message/TestMessage';
import { complete, error, next, subscribe } from './message/TestMessage';
import { createTestScheduler } from './scheduler/createTestScheduler';
import { interopOptionsFromArgument } from './utils/interopOptionsFromArgument';
export {
  expectedObservable,
  expectedSubscription,
  RxSandboxInstance,
  RxAsyncSandboxInstance
} from './interfaces/RxSandboxInstance';

type marbleAssertion = typeof marbleAssert;

/**
 * Creates a new instance of test scheduler for testing observables.
 *
 * @return {RxSandboxInstance} instance of test scheduler interfaces.
 */
function create(autoFlush?: boolean, frameTimeFactor?: number, maxFrameValue?: number): RxSandboxInstance;
/**
 * Creates a new instance of test scheduler flushes action with native async tick for testing observables.
 *
 * NOTE: this is beta feature and likely have some issues. Also Until stablized internal implementation can change without sember breaking.
 * @param {AsyncFlushSandboxOption} [options] customizable options to create test scheduler
 */
function create(options: AsyncFlushSandboxOption): RxAsyncSandboxInstance;
/**
 * Creates a new instance of test scheduler for testing observables.
 *
 * @param {SandboxOptions} [options] customizable options to create test scheduler.
 * @return {RxSandboxInstance} instance of test scheduler interfaces.
 */
function create(options?: Partial<SandboxOption>): RxSandboxInstance;
function create(...args: Array<any>): any {
  const { autoFlush, frameTimeFactor, maxFrameValue, flushWithAsyncTick } = interopOptionsFromArgument(args);

  // to get overloaded signatures
  const instance = flushWithAsyncTick ?
    createTestScheduler(autoFlush, frameTimeFactor, Math.round(maxFrameValue / frameTimeFactor), true) :
    createTestScheduler(autoFlush, frameTimeFactor, Math.round(maxFrameValue / frameTimeFactor), false);

  return {
    ...instance,
    e: <T = string>(marble: string, value?: { [key: string]: T } | null, error?: any) =>
      parseObservableMarble(marble, value, error, true, frameTimeFactor, frameTimeFactor * maxFrameValue),
    s: (marble: string) => parseSubscriptionMarble(marble, frameTimeFactor, frameTimeFactor * maxFrameValue),
  };
}

const rxSandbox = {
  create,
  marbleAssert,
};

export { rxSandbox, TestMessage, marbleAssertion, next, error, complete, subscribe };
