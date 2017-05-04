import * as Rx from 'rxjs';
import { TestMessage } from 'rxjs/testing/TestMessage';
import { SubscriptionLog } from 'rxjs/testing/SubscriptionLog';

/**
 * Represents single metadata value emitted by HotObservable<T> or ColdObservable<T>
 *
 */
export class TestMessageValue<T = string> implements TestMessage {

  constructor(public readonly frame: number,
              public readonly notification: Rx.Notification<T>) { }
}

/**
 * Utility function to generate TestMessage represents value for Observer::next()
 * @param frame virtual frame time when value will be emitted
 * @param value
 */
export function next<T = string>(frame: number, value: T): TestMessage {
  return new TestMessageValue(frame, Rx.Notification.createNext(value));
}

/**
 * Utility function to generate TestMessage represents error for Observer::error()
 * @param frame virtual frame time when value will be emitted
 * @param value
 */
export function error(frame: number, error: any): TestMessage {
  return new TestMessageValue<any>(frame, Rx.Notification.createError(error));
}

/**
 * Utility function to generate TestMessage represents completion for Observer::complete()
 * @param frame virtual frame time when value will be emitted
 */
export function complete(frame: number): TestMessage {
  return new TestMessageValue<void>(frame, Rx.Notification.createComplete());
}

export function subscribe(subscribedFrame: number,
                          unsubscribedFrame: number = Number.POSITIVE_INFINITY) {
  return new SubscriptionLog(subscribedFrame, unsubscribedFrame);
}