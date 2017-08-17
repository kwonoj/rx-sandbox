import { TestMessage } from '../message/TestMessage';
import { SubscriptionMarbleToken } from './SubscriptionMarbleToken';

const parseObservableMarble = <T>(
  marble: string,
  _value?: { [key: string]: T },
  _error?: any,
  _materializeInnerObservables: boolean = false
): Array<TestMessage<T>> => {
  if (marble.indexOf(SubscriptionMarbleToken.UNSUBSCRIBE) !== -1) {
    throw new Error(`Observable marble cannot have unsubscription marker ${SubscriptionMarbleToken.UNSUBSCRIBE}`);
  }

  const messages = Array.from(marble).reduce((acc: Array<any>, _value: string) => {
    return acc;
  }, []);

  return messages;
};

export { parseObservableMarble };
