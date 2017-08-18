import { Observable } from 'rxjs/Observable';
import { SubscriptionLog } from 'rxjs/testing/SubscriptionLog';
import { parseObservableMarble } from './marbles/parseObservableMarble';
import { parseSubscriptionMarble } from './marbles/parseSubscriptionMarble';
import { TestMessage } from './message/TestMessage';
import { TestScheduler } from './scheduler/TestScheduler';

//workaround TS4029 by explicitly import types and avoid unused import error
(() => Observable.toString())();
(() => SubscriptionLog.toString())();

const rxSandbox = {
  create: (autoFlush: boolean = false, frameTimeFactor: number = 1) => {
    const scheduler = new TestScheduler(autoFlush, frameTimeFactor);

    return {
      hot: scheduler.createHotObservable.bind(scheduler) as typeof scheduler.createHotObservable,
      cold: scheduler.createColdObservable.bind(scheduler) as typeof scheduler.createColdObservable,
      flush: scheduler.flush.bind(scheduler) as typeof scheduler.flush,
      advanceBy: scheduler.advanceBy.bind(scheduler) as typeof scheduler.advanceBy,
      advanceTo: scheduler.advanceTo.bind(scheduler) as typeof scheduler.advanceTo,
      getMarbles: scheduler.getMarbles.bind(scheduler) as typeof scheduler.getMarbles,
      e: <T = string>(marble: string, value?: { [key: string]: T } | null, error?: any) =>
        parseObservableMarble(marble, value, error, true, frameTimeFactor),
      s: (marble: string) => parseSubscriptionMarble(marble, frameTimeFactor)
    };
  }
};

export { rxSandbox, TestMessage };
