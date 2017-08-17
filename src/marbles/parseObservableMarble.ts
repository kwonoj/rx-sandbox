import { Notification } from 'rxjs/Notification';
import { TestMessage } from '../message/TestMessage';
import { TestMessageValue } from '../message/TestMessageValue';
import { ObservableMarbleToken } from './ObservableMarbleToken';
import { SubscriptionMarbleToken } from './SubscriptionMarbleToken';

const parseObservableMarble = <T>(
  marble: string,
  value?: { [key: string]: T } | null,
  error?: any,
  _materializeInnerObservables: boolean = false,
  frameTimeFactor = 1
): Array<TestMessage<T>> => {
  if (marble.indexOf(SubscriptionMarbleToken.UNSUBSCRIBE) !== -1) {
    throw new Error(`Observable marble cannot have unsubscription marker ${SubscriptionMarbleToken.UNSUBSCRIBE}`);
  }

  const subscriptionIndex = marble.indexOf(SubscriptionMarbleToken.SUBSCRIBE) * frameTimeFactor;
  const frameOffset = subscriptionIndex < 0 ? 0 : subscriptionIndex;

  const values = Array.from(marble).filter(token => token !== ObservableMarbleToken.NOOP).slice(frameOffset).reduce((
    acc: { currentOffset: number; messages: Array<TestMessage<T>> },
    token: any
  ) => {
    let message: TestMessage<T> | null = null;

    switch (token) {
      case ObservableMarbleToken.TIMEFRAME:
        acc.currentOffset += 1 * frameTimeFactor;
        break;
      case ObservableMarbleToken.ERROR:
        message = new TestMessageValue<T>(acc.currentOffset, Notification.createError(error || '#'));
        break;
      case ObservableMarbleToken.COMPLETE:
        message = new TestMessageValue<T>(acc.currentOffset, Notification.createComplete());
        break;
      case ObservableMarbleToken.TIMEFRAME_EXPAND:
        break;
      case ObservableMarbleToken.SIMULTANEOUS_START:
        acc.currentOffset += 1 * frameTimeFactor;
        break;
      case ObservableMarbleToken.SIMULTANEOUS_END:
        break;
      case SubscriptionMarbleToken.SUBSCRIBE:
        break;
      default:
        const customValue = value && value[token] ? value[token] : token;
        message = new TestMessageValue<T>(acc.currentOffset, Notification.createNext<T>(customValue));
    }

    if (!!message) {
      acc.messages.push(message);
      acc.currentOffset += 1 * frameTimeFactor;
    }

    return acc;
  }, {
    currentOffset: frameOffset,
    messages: []
  });

  return values.messages;
};

export { parseObservableMarble };
