import { matcherHint, printExpected, printReceived } from 'jest-matcher-utils';
//tslint:disable-next-line:no-require-imports
import isEqualWith = require('lodash.isequalwith');
import { SubscriptionLog } from 'rxjs/testing/SubscriptionLog';
import { TestMessage } from '../message/TestMessage';
import { constructObservableMarble } from './constructObservableMarble';
import { constructSubscriptionMarble } from './constructSubscriptionMarble';

const observableMarbleAssert = (source: Array<TestMessage>) => (expected: Array<TestMessage>) => {
  if (!Array.isArray(expected)) {
    throw new Error('Expected value is not array');
  }

  const sourceMarble = constructObservableMarble(source);
  const expectedMarble = constructObservableMarble(expected);

  if (!isEqualWith(sourceMarble, expectedMarble)) {
    throw new Error('unmatch');
  }
};

const subscriptionMarbleAssert = (source: SubscriptionLog) => (expected: SubscriptionLog) => {
  if (!(expected instanceof SubscriptionLog)) {
    throw new Error('Expected value is not SubscriptionLog');
  }

  const sourceMarble = constructSubscriptionMarble(source);
  const expectedMarble = constructSubscriptionMarble(expected);

  if (
    sourceMarble.marbleString !== expectedMarble.marbleString ||
    sourceMarble.frameString !== expectedMarble.frameString
  ) {
    const description = `${matcherHint(' to equal ', JSON.stringify(source), JSON.stringify(expected))}

    ${printReceived(`Source:   ${sourceMarble.marbleString}`)}
    ${printReceived(`          ${sourceMarble.frameString}`)}
    ${printExpected(`Expected: ${expectedMarble.marbleString}`)}
    ${printExpected(`          ${expectedMarble.frameString}`)}
    `;

    throw new Error(description);
  }
};

function marbleAssert(source: SubscriptionLog): { to: { equal(expected: SubscriptionLog): void } };
function marbleAssert(source: Array<TestMessage>): { to: { equal(expected: Array<TestMessage>): void } };
function marbleAssert(source: SubscriptionLog | Array<TestMessage>): { to: { equal(expected: object): void } } {
  const isSourceArray = Array.isArray(source);
  const isSourceSubscription = source instanceof SubscriptionLog;

  if (!isSourceArray && !isSourceSubscription) {
    throw new Error('Source is neither array nor SubscriptionLog, cannot assert');
  }

  return {
    to: {
      equal: isSourceSubscription
        ? subscriptionMarbleAssert(source as SubscriptionLog)
        : observableMarbleAssert(source as Array<TestMessage>)
    }
  };
}

export { marbleAssert, constructSubscriptionMarble };
