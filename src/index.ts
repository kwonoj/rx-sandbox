import { Observable } from 'rxjs';
import { ColdObservable } from 'rxjs/internal/testing/ColdObservable';
import { HotObservable } from 'rxjs/internal/testing/HotObservable';
import { marbleAssert } from './assert/marbleAssert';
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
  RxSandboxInstance
} from './RxSandboxInstance';

//workaround TS4029 by explicitly import types and avoid unused import error
(() => Observable.toString())();
(() => ColdObservable.toString())();
(() => HotObservable.toString())();

type marbleAssertion = typeof marbleAssert;

const rxSandbox: RxSandbox = {
  create: (autoFlush: boolean = false, frameTimeFactor: number = 1, maxFrameValue = 1000) => {
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
      s: (marble: string) => parseSubscriptionMarble(marble, frameTimeFactor, frameTimeFactor * maxFrameValue)
    };
  },
  marbleAssert: marbleAssert
};

export { rxSandbox, TestMessage, marbleAssertion, next, error, complete, subscribe };
