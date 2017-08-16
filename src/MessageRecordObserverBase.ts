import * as Rx from 'rxjs';
import { TestMessageValue } from './TestMessageValue';

/**
 * An Observer records Observable values emitted in form of TestMessageValue
 *
 */
export interface MessageRecordObserverBase<T = string> extends Rx.Observer<T> {
  /**
   * Metadata of subscribed Observable, recorded value of next(), error(), complete() calls.
   */
  readonly messages: Readonly<Array<TestMessageValue<T>>>;
}
