import { SchedulerLike, VirtualAction, VirtualTimeScheduler } from 'rxjs';
import { Observable, ObservableNotification, Subscription } from 'rxjs';
import { ReturnTypeWithArgs } from '../interfaces/ReturnTypeWithArgs';
import { parseObservableMarble } from '../marbles/parseObservableMarble';
import { SubscriptionMarbleToken } from '../marbles/SubscriptionMarbleToken';
import { TestMessage } from '../message/TestMessage';
import { TestMessageValue } from '../message/TestMessage';
import { AsyncAction, ColdObservable, HotObservable } from '../utils/coreInternalImport';
import { calculateSubscriptionFrame } from './calculateSubscriptionFrame';

/**
 * State to be bind into each function we'll create for testscheduler.
 */
interface SandboxState {
  coldObservables: Array<ColdObservable<any>>;
  hotObservables: Array<HotObservable<any>>;
  flushed: boolean;
  flushing: boolean;
  maxFrame: Readonly<number>;
  frameTimeFactor: number;
  scheduler: VirtualTimeScheduler;
  autoFlush: boolean;
}

/**
 * Naive utility fn to determine if given object is promise.
 */
const isPromise = <T = void>(obj: any): obj is Promise<T> => !!obj && Promise.resolve(obj) == obj;

/**
 * Creates `createColdObservable` function.
 */
const getCreateColdObservable = (state: SandboxState) => {
  const { frameTimeFactor, maxFrame, scheduler } = state;

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
    state.coldObservables.push(observable);
    return observable;
  }

  return createColdObservable;
};

/**
 * Creates `createHotObservable` function.
 */
const getCreateHotObservable = (state: SandboxState) => {
  const { frameTimeFactor, maxFrame, scheduler } = state;

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
    state.hotObservables.push(subject);
    return subject;
  }

  return createHotObservable;
};

/**
 * Create `flush` functions for given scheduler. If `flushWithAsyncTick` specified,
 * will create flush function to schedule individual actions into native tick.
 *
 * As we don't inherit virtualtimescheduler anymore, only these functions should be
 * used to properly flush out actions. Calling `scheduler.flush()` will not do any work.
 */
function getSchedulerFlushFunctions(
  state: SandboxState,
  flushWithAsyncTick: true
): {
  flushUntil: (toFrame?: number) => Promise<void>;
  advanceTo: (toFrame?: number) => Promise<void>;
};
function getSchedulerFlushFunctions(
  state: SandboxState,
  flushWithAsyncTick: false
): {
  flushUntil: (toFrame?: number) => void;
  advanceTo: (toFrame?: number) => void;
};
function getSchedulerFlushFunctions(state: SandboxState, flushWithAsyncTick: boolean): any {
  const { maxFrame, autoFlush } = state;

  const flushUntil = (toFrame: number = maxFrame): Promise<void> | void => {
    if (state.flushing) {
      if (flushWithAsyncTick) {
        return Promise.resolve();
      }
    }

    if (state.flushed) {
      throw new Error(`Cannot schedule to get marbles, scheduler's already flushed`);
    }

    while (state.hotObservables.length > 0) {
      state.hotObservables.shift()!.setup();
    }

    state.flushing = true;

    /**
     * Custom loop actions to schedule flusing actions synchronously or asynchronously based on flag.
     *
     * For synchronous loop, it'll use plain `while` loop. In case of flushing with tick, each action
     * will be scheduled into promise instead.
     */
    function loopActions(
      loopState: SandboxState,
      condition: (loopState: SandboxState) => boolean,
      fn: (loopState: SandboxState) => Error | undefined
    ): Promise<Error | undefined> | Error | undefined {
      if (!flushWithAsyncTick) {
        let fnResult;
        while (condition(loopState)) {
          fnResult = fn(loopState);
          if (!!fnResult) {
            break;
          }
        }

        return fnResult;
      } else {
        function loopWithTick(tickState: SandboxState, error?: Error): Promise<Error | undefined> {
          if (condition(tickState) && !error) {
            const p = new Promise<Error | undefined>((res) => res(fn(tickState)));
            return p.then((result: Error | undefined) => loopWithTick(tickState, result));
          } else {
            return Promise.resolve(error);
          }
        }

        return loopWithTick(state);
      }
    }

    // flush actions via custom loop fn, as same as
    // https://github.com/kwonoj/rx-sandbox/blob/c2922e5c5e2503739c64af626f2861b1e1f38159/src/scheduler/TestScheduler.ts#L166-L173
    const loopResult = loopActions(
      state,
      (flushState) => {
        const action = flushState.scheduler.actions[0];
        return !!action && action.delay <= toFrame;
      },
      (flushState) => {
        const action = flushState.scheduler.actions.shift()!;
        flushState.scheduler.frame = action.delay;

        return action.execute(action.state, action.delay);
      }
    );

    const tearDown = (error?: Error) => {
      state.flushing = false;

      if (toFrame >= maxFrame) {
        state.flushed = true;
      }

      if (error) {
        const { actions } = state.scheduler;
        let action: AsyncAction<any> | null | undefined = null;
        while ((action = actions.shift())) {
          action.unsubscribe();
        }
        throw error;
      }
    };

    if (isPromise<Error | undefined>(loopResult)) {
      return loopResult.then((result) => tearDown(result));
    } else {
      tearDown(loopResult);
    }
  };

  const advanceTo = (toFrame: number) => {
    if (autoFlush) {
      const error = new Error('Cannot advance frame manually with autoflushing scheduler');
      if (flushWithAsyncTick) {
        return Promise.reject(error);
      }
      throw error;
    }

    if (toFrame < 0 || toFrame < state.scheduler.frame) {
      const error = new Error(`Cannot advance frame, given frame is either negative or smaller than current frame`);
      if (flushWithAsyncTick) {
        return Promise.reject(error);
      }
      throw error;
    }

    const flushResult = flushUntil(toFrame);
    const tearDown = () => {
      state.scheduler.frame = toFrame;
    };
    return isPromise(flushResult) ? flushResult.then(() => tearDown()) : tearDown();
  };

  return { flushUntil, advanceTo };
}

type getMessages = <T = string>(observable: Observable<T>, unsubscriptionMarbles?: string | null) => void;
type getMessagesWithTick = <T = string>(
  observable: Observable<T>,
  unsubscriptionMarbles?: string | null
) => Promise<void>;

/**
 * create getMessages function. Depends on flush, this'll either work asynchronously or synchronously.
 */
function createGetMessages(state: SandboxState, flush: () => Promise<any>): getMessagesWithTick;
function createGetMessages(state: SandboxState, flush: () => void): getMessages;
function createGetMessages(state: SandboxState, flush: Function): Function {
  const { frameTimeFactor, autoFlush } = state;

  const materializeInnerObservable = <T>(observable: Observable<any>, outerFrame: number): Array<TestMessage<T>> => {
    const innerObservableMetadata: Array<TestMessage<T>> = [];
    const pushMetaData = (notification: ObservableNotification<T>) =>
      innerObservableMetadata.push(new TestMessageValue<T>(state.scheduler.frame - outerFrame, notification));

    observable.subscribe({
      next: (value) => pushMetaData({ kind: 'N', value }),
      error: (error) => pushMetaData({ kind: 'E', error }),
      complete: () => pushMetaData({ kind: 'C' }),
    });

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
      observableMetadata.push(new TestMessageValue<T | Array<TestMessage<T>>>(state.scheduler.frame, notification));

    let subscription: Subscription | null = null;
    state.scheduler.schedule(() => {
      subscription = observable.subscribe({
        next: (value: T) =>
          pushMetadata({
            kind: 'N',
            value: value instanceof Observable ? materializeInnerObservable<T>(value, state.scheduler.frame) : value,
          }),
        error: (error: any) => pushMetadata({ kind: 'E', error }),
        complete: () => pushMetadata({ kind: 'C' }),
      });
    }, subscribedFrame);

    if (unsubscribedFrame !== Number.POSITIVE_INFINITY) {
      state.scheduler.schedule(() => subscription?.unsubscribe(), unsubscribedFrame);
    }

    const flushResult = autoFlush ? flush() : null;
    if (!isPromise(flushResult)) {
      return observableMetadata;
    }

    return flushResult.then(() => observableMetadata);
  };

  return getMessages;
}

const initializeSandboxState = (autoFlush: boolean, frameTimeFactor: number, maxFrameValue: number): SandboxState => {
  const maxFrame = maxFrameValue * frameTimeFactor;
  return {
    coldObservables: [],
    hotObservables: [],
    flushed: false,
    flushing: false,
    maxFrame,
    frameTimeFactor,
    scheduler: new VirtualTimeScheduler(VirtualAction, Number.POSITIVE_INFINITY),
    autoFlush,
  };
};

interface BaseSchedulerInstance {
  /**
   * Test scheduler created for sandbox instance
   */
  scheduler: SchedulerLike;

  /**
   * Creates a hot observable using marble diagram DSL, or TestMessage.
   */
  hot: ReturnType<typeof getCreateHotObservable>;
  /**
   * Creates a cold obsrevable using marbld diagram DSL, or TestMessage.
   */
  cold: ReturnType<typeof getCreateColdObservable>;
  /**
   * Maxmium frame number scheduler will flush into.
   */
  maxFrame: number;
}

interface SchedulerInstance extends BaseSchedulerInstance {
  /**
   * Flush out currently scheduled observables, only until reaches frame specfied.
   */
  advanceTo: ReturnType<typeof getSchedulerFlushFunctions>['advanceTo'];
  /**
   * Flush out currently scheduled observables, fill values returned by `getMarbles`.
   */
  flush: () => void;
  /**
   * Get array of observable value's metadata TestMessage<T> from observable
   * created via `hot` or `cold`. Returned array will be filled once scheduler flushes
   * scheduled actions, either via explicit `flush` or implicit `autoFlush`.
   */
  getMessages: ReturnType<typeof createGetMessages>;
}

interface AsyncSchedulerInstance extends BaseSchedulerInstance {
  /**
   * Flush out currently scheduled observables, only until reaches frame specfied.
   */
  advanceTo: ReturnTypeWithArgs<typeof getSchedulerFlushFunctions, [SandboxState, true]>['advanceTo'];
  /**
   * Flush out currently scheduled observables, fill values returned by `getMarbles`.
   */
  flush: () => Promise<void>;
  /**
   * Get array of observable value's metadata TestMessage<T> from observable
   * created via `hot` or `cold`. Returned array will be filled once scheduler flushes
   * scheduled actions, either via explicit `flush` or implicit `autoFlush`.
   */
  getMessages: ReturnTypeWithArgs<typeof createGetMessages, [SandboxState, () => Promise<void>]>;
}

/**
 * Creates a new instance of virtualScheduler, along with utility functions for sandbox assertions.
 */
function createTestScheduler(
  autoFlush: boolean,
  frameTimeFactor: number,
  maxFrameValue: number,
  flushWithAsyncTick: true
): AsyncSchedulerInstance;
function createTestScheduler(
  autoFlush: boolean,
  frameTimeFactor: number,
  maxFrameValue: number,
  flushWithAsyncTick: false
): SchedulerInstance;
function createTestScheduler(
  autoFlush: boolean,
  frameTimeFactor: number,
  maxFrameValue: number,
  flushWithAsyncTick: boolean
): any {
  const sandboxState = initializeSandboxState(autoFlush, frameTimeFactor, maxFrameValue);

  const { flushUntil, advanceTo } = getSchedulerFlushFunctions(sandboxState, flushWithAsyncTick as any);
  const flush = () => flushUntil();

  return {
    scheduler: sandboxState.scheduler,
    advanceTo,
    getMessages: createGetMessages(sandboxState, flush),
    cold: getCreateColdObservable(sandboxState),
    hot: getCreateHotObservable(sandboxState),
    flush,
    maxFrame: sandboxState.maxFrame,
  };
}

export { createTestScheduler, SchedulerInstance, AsyncSchedulerInstance };
