import { Observable } from 'rxjs/Observable';
import { TestMessage } from './message/TestMessage';
import { TestScheduler } from './scheduler/TestScheduler';

//workaround TS4029 by explicitly import types and avoid unused import error
(() => Observable.toString())();

const rxSandbox = {
  create: (autoFlush: boolean = false, frameTimeFactor: number = 1) => {
    const scheduler = new TestScheduler(autoFlush, frameTimeFactor);

    return {
      hot: scheduler.createHotObservable.bind(scheduler) as typeof scheduler.createHotObservable,
      cold: scheduler.createColdObservable.bind(scheduler) as typeof scheduler.createColdObservable,
      flush: scheduler.flush.bind(scheduler) as typeof scheduler.flush,
      advanceBy: scheduler.advanceBy.bind(scheduler) as typeof scheduler.advanceBy,
      advanceTo: scheduler.advanceTo.bind(scheduler) as typeof scheduler.advanceTo
    };
  }
};

export { rxSandbox, TestMessage };
