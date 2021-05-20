import { ObservableNotification } from 'rxjs';
import { SubscriptionLog } from '../utils/coreInternalImport';

/**
 * Expanded structured type of `ObservableNotification<T>` since we can't narrow down
 * TestMessage<T> to specific notification types, instead provide wide support
 */
interface NotificationType<T> {
  kind: 'N' | 'E' | 'C';
  value?: T;
  error?: any;
}

/**
 * Represents interface for single metadata value emitted by HotObservable<T> or ColdObservable<T>
 *
 */
interface TestMessage<T = string> {
  frame: number;

  notification: NotificationType<T>;
}

/**
 * Represents single metadata value emitted by HotObservable<T> or ColdObservable<T>
 *
 */
class TestMessageValue<T = string> implements TestMessage<T> {
  constructor(public readonly frame: number, public readonly notification: ObservableNotification<T>) {}
}

/**
 * Utility function to generate TestMessage represents value for Observer::next()
 * @param frame virtual frame time when value will be emitted
 * @param value
 */

const next = <T = string>(frame: number, value: T): TestMessage<T> => new TestMessageValue(frame, { kind: 'N', value });

/**
 * Utility function to generate TestMessage represents error for Observer::error()
 * @param frame virtual frame time when value will be emitted
 * @param value
 */
const error = (frame: number, error: any = '#'): TestMessage<any> =>
  new TestMessageValue<any>(frame, { kind: 'E', error });

/**
 * Utility function to generate TestMessage represents completion for Observer::complete()
 * @param frame virtual frame time when value will be emitted
 */
const complete = <T = void>(frame: number): TestMessage<T> => new TestMessageValue<T>(frame, { kind: 'C' });

const subscribe = (
  subscribedFrame: number = Number.POSITIVE_INFINITY,
  unsubscribedFrame: number = Number.POSITIVE_INFINITY
) => new SubscriptionLog(subscribedFrame, unsubscribedFrame);

export { TestMessage, TestMessageValue, next, error, complete, subscribe };
