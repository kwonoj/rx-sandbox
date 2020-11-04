import { marbleAssert } from './assert/marbleAssert';
import { interopOptionsFromArgument } from './interopOptionsFromArgument';
import { parseObservableMarble } from './marbles/parseObservableMarble';
import { parseSubscriptionMarble } from './marbles/parseSubscriptionMarble';
import { TestMessage } from './message/TestMessage';
import { complete, error, next, subscribe } from './message/TestMessage';
import { RxSandbox } from './RxSandbox';
import { TestScheduler } from './scheduler/TestScheduler';
export {
  hotObservable,
  coldObservable,
  flushScheduler,
  advanceToScheduler,
  getObservableMessage,
  expectedObservable,
  expectedSubscription,
  RxSandboxInstance,
} from './RxSandboxInstance';

type marbleAssertion = typeof marbleAssert;

const rxSandbox: RxSandbox = {
  create: (...args: Array<any>) => {
    const { autoFlush, frameTimeFactor, maxFrameValue } = interopOptionsFromArgument(args);

    const scheduler = new TestScheduler(autoFlush, frameTimeFactor, Math.round(maxFrameValue / frameTimeFactor));

    return {
      scheduler,
      hot: scheduler.createHotObservable.bind(scheduler) as typeof scheduler.createHotObservable,
      cold: scheduler.createColdObservable.bind(scheduler) as typeof scheduler.createColdObservable,
      flush: scheduler.flush.bind(scheduler) as typeof scheduler.flush,
      advanceTo: scheduler.advanceTo.bind(scheduler) as typeof scheduler.advanceTo,
      getMessages: scheduler.getMessages.bind(scheduler) as typeof scheduler.getMessages,
      e: <T = string>(marble: string, value?: { [key: string]: T } | null, error?: any) =>
        parseObservableMarble(marble, value, error, true, frameTimeFactor, frameTimeFactor * maxFrameValue),
      s: (marble: string) => parseSubscriptionMarble(marble, frameTimeFactor, frameTimeFactor * maxFrameValue),
    };
  },
  marbleAssert: marbleAssert,
};

export { rxSandbox, TestMessage, marbleAssertion, next, error, complete, subscribe };
