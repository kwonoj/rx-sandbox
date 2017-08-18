import { Observable } from 'rxjs/Observable';
import { VirtualAction } from 'rxjs/scheduler/VirtualTimeScheduler';
import { VirtualTimeScheduler } from 'rxjs/scheduler/VirtualTimeScheduler';
import { ColdObservable } from 'rxjs/testing/ColdObservable';
import { HotObservable } from 'rxjs/testing/HotObservable';
import { parseObservableMarble } from '../marbles/parseObservableMarble';
import { SubscriptionMarbleToken } from '../marbles/SubscriptionMarbleToken';
import { TestMessage } from '../message/TestMessage';

class TestScheduler extends VirtualTimeScheduler {
  private readonly coldObservables: Array<ColdObservable<any>> = [];
  private readonly hotObservables: Array<HotObservable<any>> = [];

  constructor(private readonly autoFlush = false, private readonly frameTimeFactor = 1) {
    super(VirtualAction, Number.POSITIVE_INFINITY);
  }

  public getMarbles(): void {
    if (this.autoFlush) {
      throw new Error('not implemented');
    }
  }

  public advanceBy(_frameTime: number): void {
    throw new Error('not implemented');
  }

  public advanceTo(_frameTime: number): void {
    throw new Error('not implemented');
  }

  public createColdObservable<T = string>(marble: string, value?: { [key: string]: T }, error?: any): Observable<T>;
  public createColdObservable<T = string>(message: Array<TestMessage<T>>): Observable<T>;
  public createColdObservable<T = string>(...args: Array<any>): Observable<T> {
    const [marbleValue, value, error] = args;

    if (typeof marbleValue === 'string' && marbleValue.indexOf(SubscriptionMarbleToken.SUBSCRIBE) !== -1) {
      throw new Error(`Cold observable cannot have subscription offset ${SubscriptionMarbleToken.SUBSCRIBE}`);
    }

    const messages = Array.isArray(marbleValue)
      ? marbleValue
      : parseObservableMarble(marbleValue, value, error, false, this.frameTimeFactor);
    const observable = new ColdObservable<T>(messages, this);
    this.coldObservables.push(observable);
    return observable;
  }

  public createHotObservable<T = string>(marble: string, value?: { [key: string]: T }, error?: any): Observable<T>;
  public createHotObservable<T = string>(message: Array<TestMessage<T>>): Observable<T>;
  public createHotObservable<T = string>(...args: Array<any>): Observable<T> {
    const [marbleValue, value, error] = args;

    const messages = Array.isArray(marbleValue)
      ? marbleValue
      : parseObservableMarble(marbleValue, value, error, false, this.frameTimeFactor);
    const subject = new HotObservable<T>(messages, this);
    this.hotObservables.push(subject);
    return subject;
  }
}

export { TestScheduler };
