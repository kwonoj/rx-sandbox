import { marbleAssert } from './assert/marbleAssert';
import { RxAsyncSandboxInstance } from './interfaces/RxAsyncSandboxInstance';
import { RxSandboxInstance } from './interfaces/RxSandboxInstance';
import { AsyncFlushSandboxOption, SandboxOption } from './interfaces/SandboxOption';
import { parseObservableMarble } from './marbles/parseObservableMarble';
import { parseSubscriptionMarble } from './marbles/parseSubscriptionMarble';
import { TestMessage } from './message/TestMessage';
import { complete, error, next, subscribe } from './message/TestMessage';
import { createTestScheduler } from './scheduler/createTestScheduler';
import { interopOptionsFromArgument } from './utils/interopOptionsFromArgument';
export {
  hotObservable,
  coldObservable,
  flushScheduler,
  advanceToScheduler,
  getObservableMessage,
  expectedObservable,
  expectedSubscription,
  RxSandboxInstance,
} from './interfaces/RxSandboxInstance';

type marbleAssertion = typeof marbleAssert;

/**
 * Creates new instance of test scheduler for testing observables.
 *
 * @param {SandboxOptions} [options] customizable options to create test scheduler.
 * @return {RxSandboxInstance} instance of test scheduler interfaces.
 */
function create(autoFlush?: boolean, frameTimeFactor?: number, maxFrameValue?: number): RxSandboxInstance;
function create(options: AsyncFlushSandboxOption): RxAsyncSandboxInstance;
function create(options?: Partial<SandboxOption>): RxSandboxInstance;
function create(...args: Array<any>) {
  const { autoFlush, frameTimeFactor, maxFrameValue } = interopOptionsFromArgument(args);

  const {
    scheduler,
    createHotObservable,
    createColdObservable,
    advanceTo,
    getMessages,
    flush,
    maxFrame,
  } = createTestScheduler(autoFlush, frameTimeFactor, Math.round(maxFrameValue / frameTimeFactor));

  return {
    //todo: remove casting when deprecate maxFrame
    scheduler: scheduler as any,
    hot: createHotObservable,
    cold: createColdObservable,
    flush,
    advanceTo,
    getMessages,
    maxFrame,
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
