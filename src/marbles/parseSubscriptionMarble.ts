import { SubscriptionLog } from 'rxjs/testing/SubscriptionLog';
import { ObservableMarbleToken } from './ObservableMarbleToken';
import { SubscriptionMarbleToken } from './SubscriptionMarbleToken';

interface SubscriptionTokenParseAccumulator {
  /**
   * Current virtual time passed
   */
  currentTimeFrame: number;
  subscriptionFrame: number;
  unsubscriptionFrame: number;
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

const subscriptionTokenParseReducer = (frameTimeFactor: number = 1) => (
  acc: SubscriptionTokenParseAccumulator,
  token: string
) => {
  switch (token) {
    case SubscriptionMarbleToken.SUBSCRIBE:
      acc.subscriptionFrame = acc.currentTimeFrame;
      break;
    case SubscriptionMarbleToken.UNSUBSCRIBE:
      acc.currentTimeFrame += 1 * frameTimeFactor;
      acc.unsubscriptionFrame = acc.currentTimeFrame;
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
        acc.currentTimeFrame += expandedFrame * frameTimeFactor;
      }
      break;
    case ObservableMarbleToken.SIMULTANEOUS_START:
      if (acc.simultaneousGrouped) {
        throw new Error('Cannot nest grouped value');
      }
      acc.simultaneousGrouped = true;
      break;
    case ObservableMarbleToken.SIMULTANEOUS_END:
      acc.simultaneousGrouped = false;
    case ObservableMarbleToken.TIMEFRAME:
      if (acc.expandingTokenCount > 0 || acc.simultaneousGrouped) {
        throw new Error('Incorret timeframe specified');
      }
    case ObservableMarbleToken.ERROR:
    case ObservableMarbleToken.COMPLETE:
    default:
      if (acc.expandingTokenCount > 0) {
        acc.expandingValue.push(token);
      } else if (!acc.simultaneousGrouped) {
        acc.currentTimeFrame += 1 * frameTimeFactor;
      }
      break;
  }
  return acc;
};

const parseSubscriptionMarble = (marble: string | null, frameTimeFactor: number = 1) => {
  if (!marble) {
    return new SubscriptionLog(Number.POSITIVE_INFINITY);
  }

  const marbleTokenArray = Array.from(marble).filter(token => token !== ObservableMarbleToken.NOOP);
  const value = marbleTokenArray.reduce(subscriptionTokenParseReducer(frameTimeFactor), {
    currentTimeFrame: 0,
    subscriptionFrame: Number.POSITIVE_INFINITY,
    unsubscriptionFrame: Number.POSITIVE_INFINITY,
    simultaneousGrouped: false,
    expandingTokenCount: 0,
    expandingValue: []
  });

  return value.unsubscriptionFrame === Number.POSITIVE_INFINITY
    ? new SubscriptionLog(value.subscriptionFrame)
    : new SubscriptionLog(value.subscriptionFrame, value.unsubscriptionFrame);
};

export { parseSubscriptionMarble };
