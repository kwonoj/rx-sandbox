import { Notification } from 'rxjs/Notification';

/**
 * Represents interface for single metadata value emitted by HotObservable<T> or ColdObservable<T>
 *
 */
export interface TestMessage<T = string> {
  frame: number;
  notification: Notification<T>;
}
