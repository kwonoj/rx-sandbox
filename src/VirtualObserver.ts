import * as Rx from 'rxjs';
import { Scheduler } from 'rxjs/Scheduler';
import { TestMessageValue } from './TestMessageValue';

/**
 * Observer interface allows to record emitted values in form of TestMessageValue for inspection
 *
 */
export interface VirtualObserver<T = string> extends Rx.Observer<T> {
  readonly messages: Readonly<Array<TestMessageValue<T>>>;
}

export class BaseVirtualObserver<T = string> implements VirtualObserver<T> {
  public readonly messages: Readonly<Array<TestMessageValue<T>>> = [];

  constructor(private readonly scheduler: Scheduler) {
  }

  next(value: T): void {
    this.messages.push(new TestMessageValue(this.scheduler.now(), Rx.Notification.createNext(value)));
  }

  error(value: any): void {
    this.messages.push(new TestMessageValue<any>(this.scheduler.now(), Rx.Notification.createError(value)));
  }

  complete(): void {
    this.messages.push(new TestMessageValue(this.scheduler.now(), Rx.Notification.createComplete()));
  }
}