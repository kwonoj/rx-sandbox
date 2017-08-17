import { Notification } from 'rxjs/Notification';
import { Scheduler } from 'rxjs/Scheduler';
import { MessageRecordObserverBase } from './MessageRecordObserverBase';
import { TestMessageValue } from './TestMessageValue';

class MessageRecordObserver<T = string> implements MessageRecordObserverBase<T> {
  public readonly messages: Readonly<Array<TestMessageValue<T>>> = [];

  /**
   * Constructor.
   *
   * @param {() => number} nowMethod function returns current timeframe based on scheduler, as Scheduler::now() provides.
   */
  constructor(private readonly nowMethod: typeof Scheduler.now) {}

  next(value: T): void {
    this.messages.push(new TestMessageValue(this.nowMethod(), Notification.createNext(value)));
  }

  error(value: any): void {
    this.messages.push(new TestMessageValue<any>(this.nowMethod(), Notification.createError(value)));
  }

  complete(): void {
    this.messages.push(new TestMessageValue(this.nowMethod(), Notification.createComplete()));
  }
}

/**
 * Returns function to instantiate MessageRecordObserver.
 */
const getRecordObserverFactory: (nowMethod: typeof Scheduler.now) => <T = string>() => MessageRecordObserverBase<T> = (
  nowMethod: typeof Scheduler.now
) => <T = string>() => new MessageRecordObserver<T>(nowMethod);

export { getRecordObserverFactory };
