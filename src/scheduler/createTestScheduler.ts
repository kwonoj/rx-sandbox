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

const createTestScheduler = (autoFlush: boolean, frameTimeFactor: number, maxFrameValue: number) => {
  const coldObservables: Array<ColdObservable<any>> = [];
  const hotObservables: Array<HotObservable<any>> = [];
  let flushed = false;
  let flushing = false;
  const maxFrame = maxFrameValue * frameTimeFactor;

  const peek = (schedulerInstance: VirtualTimeScheduler) => {
    const { actions } = schedulerInstance;
    return actions?.[0] ?? null;
  };

  const flushUntil = (schedulerInstance: VirtualTimeScheduler, toFrame: number = maxFrame) => {
    if (flushing) {
      return;
    }
    while (hotObservables.length > 0) {
      hotObservables.shift()!.setup();
    }

    flushing = true;

    const { actions } = schedulerInstance;
    let error: any;
    let action: AsyncAction<any> | null | undefined = null;

    while (flushing && (action = peek(schedulerInstance)) && action.delay <= toFrame) {
      const action: AsyncAction<any> = actions.shift()!;
      schedulerInstance.frame = action.delay;

      if ((error = action.execute(action.state, action.delay))) {
        break;
      }
    }

    flushing = false;

    if (toFrame >= maxFrame) {
      flushed = true;
    }

    if (error) {
      while ((action = actions.shift())) {
        action.unsubscribe();
      }
      throw error;
    }
  };

  const scheduler = new VirtualTimeScheduler(VirtualAction, Number.POSITIVE_INFINITY);
  // @deprecated: will be deprecated, use return value of createScheduler instead
  (scheduler as any).maxFrame = maxFrame;

  const flush = () => flushUntil(scheduler);

  function createColdObservable<T = string>(
    marble: string,
    value?: { [key: string]: T } | null,
    error?: any
  ): ColdObservable<T>;
  function createColdObservable<T = string>(message: Array<TestMessage<T>>): ColdObservable<T>;
  function createColdObservable<T = string>(...args: Array<any>): ColdObservable<T> {
    const [marbleValue, value, error] = args;

    if (typeof marbleValue === 'string' && marbleValue.indexOf(SubscriptionMarbleToken.SUBSCRIBE) !== -1) {
      throw new Error(`Cold observable cannot have subscription offset ${SubscriptionMarbleToken.SUBSCRIBE}`);
    }

    const messages = Array.isArray(marbleValue)
      ? marbleValue
      : (parseObservableMarble(marbleValue, value, error, false, frameTimeFactor, maxFrame) as any);
    const observable = new ColdObservable<T>(messages as Array<TestMessage<T | Array<TestMessage<T>>>>, scheduler);
    coldObservables.push(observable);
    return observable;
  }

  function createHotObservable<T = string>(
    marble: string,
    value?: { [key: string]: T } | null,
    error?: any
  ): HotObservable<T>;
  function createHotObservable<T = string>(message: Array<TestMessage<T>>): HotObservable<T>;
  function createHotObservable<T = string>(...args: Array<any>): HotObservable<T> {
    const [marbleValue, value, error] = args;

    const messages = Array.isArray(marbleValue)
      ? marbleValue
      : (parseObservableMarble(marbleValue, value, error, false, frameTimeFactor, maxFrame) as any);
    const subject = new HotObservable<T>(messages as Array<TestMessage<T | Array<TestMessage<T>>>>, scheduler);
    hotObservables.push(subject);
    return subject;
  }

  const advanceTo = (toFrame: number) => {
    if (autoFlush) {
      throw new Error('Cannot advance frame manually with autoflushing scheduler');
    }

    if (toFrame < 0 || toFrame < scheduler.frame) {
      throw new Error(`Cannot advance frame, given frame is either negative or smaller than current frame`);
    }

    flushUntil(scheduler, toFrame);
    scheduler.frame = toFrame;
  };

  const materializeInnerObservable = <T>(observable: Observable<any>, outerFrame: number): Array<TestMessage<T>> => {
    const innerObservableMetadata: Array<TestMessage<T>> = [];
    const pushMetaData = (notification: ObservableNotification<T>) =>
      innerObservableMetadata.push(new TestMessageValue<T>(scheduler.frame - outerFrame, notification));

    observable.subscribe(
      (value) => pushMetaData(nextNotification(value)),
      (err) => pushMetaData(errorNotification(err)),
      () => pushMetaData(COMPLETE_NOTIFICATION)
    );

    return innerObservableMetadata;
  };

  const getMessages = <T = string>(observable: Observable<T>, unsubscriptionMarbles: string | null = null) => {
    const { subscribedFrame, unsubscribedFrame } = calculateSubscriptionFrame(
      observable,
      unsubscriptionMarbles,
      frameTimeFactor
    );

    const observableMetadata: Array<TestMessage<T | Array<TestMessage<T>>>> = [];
    const pushMetadata = (notification: ObservableNotification<T | Array<TestMessage<T>>>) =>
      observableMetadata.push(new TestMessageValue<T | Array<TestMessage<T>>>(scheduler.frame, notification));

    let subscription: Subscription | null = null;
    scheduler.schedule(() => {
      subscription = observable.subscribe(
        (value: T) =>
          pushMetadata(
            nextNotification(
              value instanceof Observable ? materializeInnerObservable<T>(value, scheduler.frame) : value
            )
          ),
        (err: any) => pushMetadata(errorNotification(err)),
        () => pushMetadata(COMPLETE_NOTIFICATION)
      );
    }, subscribedFrame);

    if (unsubscribedFrame !== Number.POSITIVE_INFINITY) {
      scheduler.schedule(() => subscription!.unsubscribe(), unsubscribedFrame);
    }

    if (autoFlush) {
      if (flushed) {
        throw new Error(`Cannot schedule to get marbles, scheduler's already flushed`);
      }
      flushUntil(scheduler);
    }

    return observableMetadata;
  };

  return {
    scheduler,
    advanceTo,
    getMessages,
    createColdObservable,
    createHotObservable,
    flush,
    maxFrame,
  };
};

export { createTestScheduler };
