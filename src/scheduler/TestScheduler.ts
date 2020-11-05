import { VirtualAction, VirtualTimeScheduler } from 'rxjs';
import { Observable, ObservableNotification, Subscription } from 'rxjs';
import { parseObservableMarble } from '../marbles/parseObservableMarble';
import { SubscriptionMarbleToken } from '../marbles/SubscriptionMarbleToken';
import { TestMessage } from '../message/TestMessage';
import { TestMessageValue } from '../message/TestMessage';
import {
  AsyncAction,
  ColdObservable,
  COMPLETE_NOTIFICATION,
  errorNotification,
  HotObservable,
  nextNotification,
} from '../utils/coreInternalImport';
import { calculateSubscriptionFrame } from './calculateSubscriptionFrame';

/**
 * @internal
 */
class TestScheduler extends VirtualTimeScheduler {
  private readonly coldObservables: Array<ColdObservable<any>> = [];
  private readonly hotObservables: Array<HotObservable<any>> = [];
  private flushed: boolean = false;
  private flushing: boolean = false;

  private readonly _maxFrame: number;

  constructor(private readonly autoFlush: boolean, private readonly frameTimeFactor: number, maxFrameValue: number) {
    super(VirtualAction, Number.POSITIVE_INFINITY);
    this._maxFrame = maxFrameValue * frameTimeFactor;
  }

  public get maxFrame(): number {
    return this._maxFrame;
  }

  public flush(): void {
    this.flushUntil();
  }

  public getMessages<T = string>(observable: Observable<T>, unsubscriptionMarbles: string | null = null) {
    const { subscribedFrame, unsubscribedFrame } = calculateSubscriptionFrame(
      observable,
      unsubscriptionMarbles,
      this.frameTimeFactor
    );

    const observableMetadata: Array<TestMessage<T | Array<TestMessage<T>>>> = [];
    const pushMetadata = (notification: ObservableNotification<T | Array<TestMessage<T>>>) =>
      observableMetadata.push(new TestMessageValue<T | Array<TestMessage<T>>>(this.frame, notification));

    let subscription: Subscription | null = null;
    this.schedule(() => {
      subscription = observable.subscribe(
        (value: T) =>
          pushMetadata(
            nextNotification(
              value instanceof Observable ? this.materializeInnerObservable<T>(value, this.frame) : value
            )
          ),
        (err: any) => pushMetadata(errorNotification(err)),
        () => pushMetadata(COMPLETE_NOTIFICATION)
      );
    }, subscribedFrame);

    if (unsubscribedFrame !== Number.POSITIVE_INFINITY) {
      this.schedule(() => subscription!.unsubscribe(), unsubscribedFrame);
    }

    if (this.autoFlush) {
      if (this.flushed) {
        throw new Error(`Cannot schedule to get marbles, scheduler's already flushed`);
      }
      this.flush();
    }

    return observableMetadata;
  }

  public createColdObservable<T = string>(
    marble: string,
    value?: { [key: string]: T } | null,
    error?: any
  ): ColdObservable<T>;
  public createColdObservable<T = string>(message: Array<TestMessage<T>>): ColdObservable<T>;
  public createColdObservable<T = string>(...args: Array<any>): ColdObservable<T> {
    const [marbleValue, value, error] = args;

    if (typeof marbleValue === 'string' && marbleValue.indexOf(SubscriptionMarbleToken.SUBSCRIBE) !== -1) {
      throw new Error(`Cold observable cannot have subscription offset ${SubscriptionMarbleToken.SUBSCRIBE}`);
    }

    const messages = Array.isArray(marbleValue)
      ? marbleValue
      : (parseObservableMarble(marbleValue, value, error, false, this.frameTimeFactor, this._maxFrame) as any);
    const observable = new ColdObservable<T>(messages as Array<TestMessage<T | Array<TestMessage<T>>>>, this);
    this.coldObservables.push(observable);
    return observable;
  }

  public createHotObservable<T = string>(
    marble: string,
    value?: { [key: string]: T } | null,
    error?: any
  ): HotObservable<T>;
  public createHotObservable<T = string>(message: Array<TestMessage<T>>): HotObservable<T>;
  public createHotObservable<T = string>(...args: Array<any>): HotObservable<T> {
    const [marbleValue, value, error] = args;

    const messages = Array.isArray(marbleValue)
      ? marbleValue
      : (parseObservableMarble(marbleValue, value, error, false, this.frameTimeFactor, this._maxFrame) as any);
    const subject = new HotObservable<T>(messages as Array<TestMessage<T | Array<TestMessage<T>>>>, this);
    this.hotObservables.push(subject);
    return subject;
  }

  public advanceTo(toFrame: number): void {
    if (this.autoFlush) {
      throw new Error('Cannot advance frame manually with autoflushing scheduler');
    }

    if (toFrame < 0 || toFrame < this.frame) {
      throw new Error(`Cannot advance frame, given frame is either negative or smaller than current frame`);
    }

    this.flushUntil(toFrame);
    this.frame = toFrame;
  }

  private materializeInnerObservable<T>(observable: Observable<any>, outerFrame: number): Array<TestMessage<T>> {
    const innerObservableMetadata: Array<TestMessage<T>> = [];
    const pushMetaData = (notification: ObservableNotification<T>) =>
      innerObservableMetadata.push(new TestMessageValue<T>(this.frame - outerFrame, notification));

    observable.subscribe(
      (value) => pushMetaData(nextNotification(value)),
      (err) => pushMetaData(errorNotification(err)),
      () => pushMetaData(COMPLETE_NOTIFICATION)
    );

    return innerObservableMetadata;
  }

  private peek(): AsyncAction<any> | null {
    const { actions } = this;
    return actions && actions.length > 0 ? actions[0] : null;
  }

  private flushUntil(toFrame: number = this.maxFrame): void {
    if (this.flushing) {
      return;
    }

    const { hotObservables } = this;
    while (hotObservables.length > 0) {
      hotObservables.shift()!.setup();
    }

    this.flushing = true;

    const { actions } = this;
    let error: any;
    let action: AsyncAction<any> | null | undefined = null;

    while (this.flushing && (action = this.peek()) && action.delay <= toFrame) {
      const action: AsyncAction<any> = actions.shift()!;
      this.frame = action.delay;

      if ((error = action.execute(action.state, action.delay))) {
        break;
      }
    }

    this.flushing = false;

    if (toFrame >= this.maxFrame) {
      this.flushed = true;
    }

    if (error) {
      while ((action = actions.shift())) {
        action.unsubscribe();
      }
      throw error;
    }
  }
}

const createTestScheduler = (() => {
  return (autoFlush: boolean, frameTimeFactor: number, maxFrameValue: number) =>
    new TestScheduler(autoFlush, frameTimeFactor, maxFrameValue);
})();

export { createTestScheduler };
