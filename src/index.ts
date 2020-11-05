import { marbleAssert } from './assert/marbleAssert';
import { RxSandbox } from './interfaces/RxSandbox';
import { parseObservableMarble } from './marbles/parseObservableMarble';
import { parseSubscriptionMarble } from './marbles/parseSubscriptionMarble';
import { TestMessage } from './message/TestMessage';
import { complete, error, next, subscribe } from './message/TestMessage';
import { createTestScheduler } from './scheduler/TestScheduler';
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

const rxSandbox: RxSandbox = {
  create: (...args: Array<any>) => {
    const { autoFlush, frameTimeFactor, maxFrameValue } = interopOptionsFromArgument(args);

    const scheduler = createTestScheduler(autoFlush, frameTimeFactor, Math.round(maxFrameValue / frameTimeFactor));

    return {
      scheduler,
      hot: scheduler.createHotObservable.bind(scheduler),
      cold: scheduler.createColdObservable.bind(scheduler),
      flush: scheduler.flush.bind(scheduler),
      advanceTo: scheduler.advanceTo.bind(scheduler),
      getMessages: scheduler.getMessages.bind(scheduler),
      e: <T = string>(marble: string, value?: { [key: string]: T } | null, error?: any) =>
        parseObservableMarble(marble, value, error, true, frameTimeFactor, frameTimeFactor * maxFrameValue),
      s: (marble: string) => parseSubscriptionMarble(marble, frameTimeFactor, frameTimeFactor * maxFrameValue),
    };
  },
  marbleAssert: marbleAssert,
};

export { rxSandbox, TestMessage, marbleAssertion, next, error, complete, subscribe };
