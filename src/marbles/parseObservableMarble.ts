import { Notification } from 'rxjs/Notification';
import { TestMessage } from '../message/TestMessage';
import { TestMessageValue } from '../message/TestMessageValue';
import { ObservableMarbleToken } from './ObservableMarbleToken';
import { SubscriptionMarbleToken } from './SubscriptionMarbleToken';

interface TokenParseAccumulator<T> {
  /**
   * Current virtual time passed
   */
  currentTimeframe: number;
  /**
   * Meta values emitted by marbles (value, error, complete)
   */
  messages: Array<TestMessage<T>>;
  /**
   * Flag indicate values are grouped `()` and emitted simultaneously
   */
  simultaneousGrouped: boolean;
  /**
   * Flag indicate timeframe expansion `...` is in progress
   */
  expandingTokenCount: number;
  /**
   * Tokens for expanding timeframe, will be joined & parsed into number
   */
  expandingValue: Array<string>;
}

const marbleTokenParseReducer = <T>(value?: { [key: string]: T } | null, error?: any, frameTimeFactor: number = 1) => (
  acc: TokenParseAccumulator<T>,
  token: any
) => {
  let message: TestMessage<T> | null = null;

  switch (token) {
    case ObservableMarbleToken.TIMEFRAME:
      if (acc.expandingTokenCount > 0 || acc.simultaneousGrouped) {
        throw new Error('Incorret timeframe specified');
      }
      acc.currentTimeframe += 1 * frameTimeFactor;
      break;
    case ObservableMarbleToken.ERROR:
      message = new TestMessageValue<T>(acc.currentTimeframe, Notification.createError(error || '#'));
      break;
    case ObservableMarbleToken.COMPLETE:
      message = new TestMessageValue<T>(acc.currentTimeframe, Notification.createComplete());
      break;
    case ObservableMarbleToken.TIMEFRAME_EXPAND:
      acc.expandingTokenCount += 1;

      //When token reaches ...xxx..., clean up state
      if (acc.expandingTokenCount === 6) {
        acc.expandingValue.splice(0);
        acc.expandingTokenCount = 0;
      }

      //When first ending token arrives ...xxx. , parse values and adjust timeframe
      if (acc.expandingTokenCount === 4) {
        if (acc.expandingValue.length === 0) {
          throw new Error(`There isn't value to expand timeframe`);
        }
        const expandedFrame = parseInt(acc.expandingValue.join(''), 10);
        acc.currentTimeframe += expandedFrame * frameTimeFactor;
      }
      break;
    case ObservableMarbleToken.SIMULTANEOUS_START:
      if (acc.simultaneousGrouped) {
        throw new Error('Cannot nest grouped value');
      }
      acc.simultaneousGrouped = true;
      break;
    case ObservableMarbleToken.SIMULTANEOUS_END:
      acc.currentTimeframe += 1 * frameTimeFactor;
      acc.simultaneousGrouped = false;
      break;
    case SubscriptionMarbleToken.SUBSCRIBE:
      break;
    default:
      if (acc.expandingTokenCount > 0) {
        acc.expandingValue.push(token);
      } else {
        const customValue = value && value[token] ? value[token] : token;
        message = new TestMessageValue<T>(acc.currentTimeframe, Notification.createNext<T>(customValue));
      }
  }

  if (!!message) {
    acc.messages.push(message);
    if (!acc.simultaneousGrouped) {
      acc.currentTimeframe += 1 * frameTimeFactor;
    }
  }

  return acc;
};
/**
 * Parse marble DSL diagram, generates array of TestMessageValue for metadata of each marble values to be scheduled into.
 *
 * @param {string} marble Marble diagram to parse
 * @param {{ [key: string]: T }} [value] Custom value for marble value
 * @param {any} [error] Custom error for marble error
 * @param {boolean} [materializeInnerObservables] Flatten inner observables in cold observable. False by default.
 * @param {number} [frameTimeFactor] Custom frametime factor for virtual time frame. 1 by default.
 */
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

  const marbleTokenArray = Array.from(marble).filter(token => token !== ObservableMarbleToken.NOOP).slice(frameOffset);
  const values = marbleTokenArray.reduce(marbleTokenParseReducer(value, error, frameTimeFactor), {
    currentTimeframe: frameOffset,
    messages: [],
    simultaneousGrouped: false,
    expandingTokenCount: 0,
    expandingValue: []
  });

  return values.messages;
};

export { parseObservableMarble };
