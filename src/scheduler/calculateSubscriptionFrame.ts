import { Observable } from 'rxjs';
import { parseSubscriptionMarble } from '../marbles/parseSubscriptionMarble';

//tslint:disable no-var-requires no-require-imports
const { ColdObservable } = require('rxjs/dist/cjs/internal/testing/ColdObservable');
const { HotObservable } = require('rxjs/dist/cjs/internal/testing/HotObservable');
//tslint:enable no-var-requires no-require-imports

const calculateSubscriptionFrame = (
  observable: Observable<any>,
  unsubscriptionMarbles: string | null,
  frameTimeFactor: number
) => {
  const { subscribedFrame, unsubscribedFrame } = parseSubscriptionMarble(unsubscriptionMarbles, frameTimeFactor);

  if (subscribedFrame === Number.POSITIVE_INFINITY) {
    return { subscribedFrame: 0, unsubscribedFrame };
  }

  //looks internal of Observable implementation to determine source is hot or cold observable.
  //if source is hot, subscription / unsubscription works as specified,
  //if source is cold, subscription always triggers start of observable - adjust unsubscription frame as well
  let source = observable;
  while (!!source) {
    if (source instanceof HotObservable) {
      return { subscribedFrame, unsubscribedFrame };
    } else if (source instanceof ColdObservable) {
      return {
        subscribedFrame: 0,
        unsubscribedFrame:
          unsubscribedFrame === Number.POSITIVE_INFINITY ? unsubscribedFrame : unsubscribedFrame - subscribedFrame,
      };
    }
    source = (source as any).source;
  }

  throw new Error('Cannot detect source observable type');
};

export { calculateSubscriptionFrame };
