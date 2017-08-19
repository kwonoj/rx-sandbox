import { Notification } from 'rxjs/Notification';
import { ColdObservable } from 'rxjs/testing/ColdObservable';
import { TestMessage } from '../message/TestMessage';
import { TestMessageValue } from '../message/TestMessageValue';
import { ObservableMarbleToken } from './ObservableMarbleToken';
import { SubscriptionMarbleToken } from './SubscriptionMarbleToken';

/**
 * @internal
 * Base accumulator interface for parsing marble diagram.
 */
interface TokenParseAccumulator {
  /**
   * Current virtual time passed
   */
  currentTimeFrame: number;
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

/**
 * @internal
 * Accumulator interface for parsing observable marble diagram.
 */
interface ObservableTokenParseAccumulator<T> extends TokenParseAccumulator {
  /**
   * Meta values emitted by marbles (value, error, complete)
   */
  messages: Array<TestMessage<T | Array<TestMessage<T>>>>;
}

/**
 * @internal
 * Accumulator interface for parsing subscription marble diagram.
 */
interface SubscriptionTokenParseAccumulator extends TokenParseAccumulator {
  subscriptionFrame: number;
  unsubscriptionFrame: number;
}

/**
 * Translate single token in marble diagram to correct metadata
 * @param {any} token Single char in marble diagram
 * @param {{ [key: string]: T }} [value] Custom value for marble value
 * @param {boolean} [materializeInnerObservables] Flatten inner observables in cold observable. False by default.
 */
const getMarbleTokenValue = <T>(
  token: any,
  value: { [key: string]: T } | null,
  materializeInnerObservables: boolean
) => {
  const customValue = value && value[token] ? value[token] : token;

  return materializeInnerObservables && customValue instanceof ColdObservable ? customValue.messages : customValue;
};

const timeFrameExpandTokenHandler = (acc: TokenParseAccumulator, frameTimeFactor: number) => {
  const ret = { ...acc };
  ret.expandingTokenCount += 1;

  //When token reaches ...xxx..., clean up state
  if (ret.expandingTokenCount === 6) {
    ret.expandingValue.splice(0);
    ret.expandingTokenCount = 0;
  }

  //When first ending token arrives ...xxx. , parse values and adjust timeframe
  if (ret.expandingTokenCount === 4) {
    if (ret.expandingValue.length === 0) {
      throw new Error(`There isn't value to expand timeframe`);
    }
    const expandedFrame = parseInt(ret.expandingValue.join(''), 10);
    ret.currentTimeFrame += expandedFrame * frameTimeFactor;
  }

  return ret as any;
};

const validateTimeFrameToken = (acc: TokenParseAccumulator) => {
  if (acc.expandingTokenCount > 0 || acc.simultaneousGrouped) {
    throw new Error('Incorret timeframe specified');
  }
};

const validateSimultaneousGroupToken = (acc: TokenParseAccumulator) => {
  if (acc.simultaneousGrouped) {
    throw new Error('Cannot nest grouped value');
  }
};

const increaseTimeFrame = (acc: TokenParseAccumulator, frameTimeFactor: number) => {
  const ret = { ...acc };
  ret.currentTimeFrame += 1 * frameTimeFactor;
  return ret as any;
};

/**
 * @internal
 * Reducer to traverse Observable marble diagram to generate TestMessage metadata.
 * @param value Custom values for marble values
 * @param error Custom error
 * @param materializeInnerObservables Flatten inner observable if available
 * @param frameTimeFactor Custom timeframe factor
 */
const observableTokenParseReducer = <T>(
  value: { [key: string]: T } | null,
  error: any,
  materializeInnerObservables: boolean,
  frameTimeFactor: number
) => (acc: ObservableTokenParseAccumulator<T>, token: any) => {
  let message: TestMessage<T | Array<TestMessage<T>>> | null = null;

  switch (token) {
    case ObservableMarbleToken.TIMEFRAME:
      validateTimeFrameToken(acc);
      acc = increaseTimeFrame(acc, frameTimeFactor);
      break;
    case ObservableMarbleToken.ERROR:
      message = new TestMessageValue<T>(acc.currentTimeFrame, Notification.createError(error || '#'));
      break;
    case ObservableMarbleToken.COMPLETE:
      message = new TestMessageValue<T>(acc.currentTimeFrame, Notification.createComplete());
      break;
    case ObservableMarbleToken.TIMEFRAME_EXPAND:
      acc = timeFrameExpandTokenHandler(acc, frameTimeFactor);
      break;
    case ObservableMarbleToken.SIMULTANEOUS_START:
      validateSimultaneousGroupToken(acc);
      acc.simultaneousGrouped = true;
      break;
    case ObservableMarbleToken.SIMULTANEOUS_END:
      acc = increaseTimeFrame(acc, frameTimeFactor);
      acc.simultaneousGrouped = false;
      break;
    case SubscriptionMarbleToken.SUBSCRIBE:
      break;
    default:
      if (acc.expandingTokenCount > 0) {
        acc.expandingValue.push(token);
      } else {
        const tokenValue = getMarbleTokenValue(token, value, materializeInnerObservables);
        message = new TestMessageValue<T | Array<TestMessage<T>>>(
          acc.currentTimeFrame,
          Notification.createNext<T | Array<TestMessage<T>>>(tokenValue)
        );
      }
  }

  if (!!message) {
    acc.messages.push(message);
    if (!acc.simultaneousGrouped) {
      acc = increaseTimeFrame(acc, frameTimeFactor);
    }
  }

  return acc;
};

/**
 * @internal
 * Reducer to traverse subscription marble diagram to generate SubscriptionLog metadata.
 * @param frameTimeFactor Custom timeframe factor
 */
const subscriptionTokenParseReducer = (frameTimeFactor: number) => (
  acc: SubscriptionTokenParseAccumulator,
  token: string
) => {
  switch (token) {
    case SubscriptionMarbleToken.SUBSCRIBE:
      acc.subscriptionFrame = acc.currentTimeFrame;
      acc = increaseTimeFrame(acc, frameTimeFactor);
      break;
    case SubscriptionMarbleToken.UNSUBSCRIBE:
      acc.unsubscriptionFrame = acc.currentTimeFrame;
      break;
    case ObservableMarbleToken.TIMEFRAME_EXPAND:
      acc = timeFrameExpandTokenHandler(acc, frameTimeFactor);
      break;
    case ObservableMarbleToken.SIMULTANEOUS_START:
      validateSimultaneousGroupToken(acc);
      acc.simultaneousGrouped = true;
      break;
    case ObservableMarbleToken.SIMULTANEOUS_END:
      acc.simultaneousGrouped = false;
    case ObservableMarbleToken.TIMEFRAME:
      validateTimeFrameToken(acc);
    case ObservableMarbleToken.ERROR:
    case ObservableMarbleToken.COMPLETE:
    default:
      if (acc.expandingTokenCount > 0) {
        acc.expandingValue.push(token);
      } else if (!acc.simultaneousGrouped) {
        acc = increaseTimeFrame(acc, frameTimeFactor);
      }
      break;
  }
  return acc;
};

export {
  TokenParseAccumulator,
  ObservableTokenParseAccumulator,
  SubscriptionTokenParseAccumulator,
  subscriptionTokenParseReducer,
  observableTokenParseReducer
};
