import { Observable } from 'rxjs/Observable';
import { VirtualTimeScheduler } from 'rxjs/scheduler/VirtualTimeScheduler';
import { ColdObservable } from 'rxjs/testing/ColdObservable';
import { HotObservable } from 'rxjs/testing/HotObservable';
import { SubscriptionMarbleToken } from '../marbles/SubscriptionMarbleToken';
import { TestMessage } from '../message/TestMessage';

const parseMarbles = (..._args: Array<any>) => {
  return [];
};

class TestScheduler extends VirtualTimeScheduler {
  public createColdObservable<T = string>(marble: string, value?: { [key: string]: T }, error?: any): Observable<T>;
  public createColdObservable<T = string>(message: Array<TestMessage<T>>): Observable<T>;
  public createColdObservable<T = string>(...args: Array<any>): Observable<T> {
    const [marbleValue, value, error] = args;

    if (typeof marbleValue === 'string' && marbleValue.indexOf(SubscriptionMarbleToken.SUBSCRIBE) !== -1) {
      throw new Error(`Cold observable cannot have subscription offset ${SubscriptionMarbleToken.SUBSCRIBE}`);
    }

    const messages = Array.isArray(marbleValue) ? marbleValue : parseMarbles(marbleValue, value, error);
    const observable = new ColdObservable<T>(messages, this);
    return observable;
  }

  public createHotObservable<T = string>(marble: string, value?: { [key: string]: T }, error?: any): Observable<T>;
  public createHotObservable<T = string>(message: Array<TestMessage<T>>): Observable<T>;
  public createHotObservable<T = string>(...args: Array<any>): Observable<T> {
    const [marbleValue, value, error] = args;

    const messages = Array.isArray(marbleValue) ? marbleValue : parseMarbles(marbleValue, value, error);
    const subject = new HotObservable<T>(messages, this);
    return subject;
  }
}

export { TestScheduler };
