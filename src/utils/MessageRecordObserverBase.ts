import * as Rx from 'rxjs';
import { Scheduler } from 'rxjs/Scheduler';
import { TestMessageValue } from '../TestMessageValue';
import { MessageRecordObserver } from './MessageRecordObserver';

class MessageRecordObserverBase<T = string> implements MessageRecordObserver<T> {
  public readonly messages: Readonly<Array<TestMessageValue<T>>> = [];

  /**
   * Constructor.
   *
   * @param {() => number} nowMethod function returns current timeframe based on scheduler, as Scheduler::now() provides.
   */
  constructor(private readonly nowMethod: typeof Scheduler.now) {
  }

  next(value: T): void {
    this.messages.push(new TestMessageValue(this.nowMethod(), Rx.Notification.createNext(value)));
  }

  error(value: any): void {
    this.messages.push(new TestMessageValue<any>(this.nowMethod(), Rx.Notification.createError(value)));
  }

  complete(): void {
    this.messages.push(new TestMessageValue(this.nowMethod(), Rx.Notification.createComplete()));
  }
}

const recordObserverFactory: (nowMethod: typeof Scheduler.now) => <T = string>() => MessageRecordObserver<T> =
  (nowMethod: typeof Scheduler.now) => <T = string>() => new MessageRecordObserverBase<T>(nowMethod);

export {
  recordObserverFactory
};