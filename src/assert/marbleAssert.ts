import { matcherHint, printExpected, printReceived } from 'jest-matcher-utils';
import { toEqual } from 'jest-matchers/build/matchers';
import { SubscriptionLog } from 'rxjs/testing/SubscriptionLog';
import { TestMessage } from '../message/TestMessage';
import { constructObservableMarble } from './constructObservableMarble';
import { constructSubscriptionMarble } from './constructSubscriptionMarble';

const toEqulAssert = toEqual.bind({ expand: false });

const observableMarbleAssert = <T = string>(source: Array<TestMessage<T>> | Readonly<Array<TestMessage<T>>>) => (
  expected: Array<TestMessage<T>> | Readonly<Array<TestMessage<T>>>
) => {
  if (!Array.isArray(expected)) {
    throw new Error('Expected value is not array');
  }

  const sourceMarble = constructObservableMarble(source);
  const expectedMarble = constructObservableMarble(expected);

  const asserted = toEqulAssert(source, expected);

  if (!asserted.pass) {
    const description = `
${printReceived(`Source:   ${sourceMarble}`)}
${printExpected(`Expected: ${expectedMarble}`)}

${asserted.message()}
    `;
    throw new Error(description);
  }
};

const subscriptionMarbleAssert = (source: SubscriptionLog) => (expected: SubscriptionLog) => {
  if (!(expected instanceof SubscriptionLog)) {
    throw new Error('Expected value is not SubscriptionLog');
  }

  const sourceMarble = constructSubscriptionMarble(source);
  const expectedMarble = constructSubscriptionMarble(expected);

  const asserted = toEqulAssert(sourceMarble, expectedMarble);

  if (!asserted.pass) {
    const description = `
${matcherHint(' to equal ', JSON.stringify(source), JSON.stringify(expected))}

${printReceived(`Source:   ${sourceMarble.marbleString}`)}
${printReceived(`          ${sourceMarble.frameString}`)}
${printExpected(`Expected: ${expectedMarble.marbleString}`)}
${printExpected(`          ${expectedMarble.frameString}`)}
    `;

    throw new Error(description);
  }
};

function marbleAssert<T = void>(source: SubscriptionLog): { to: { equal(expected: SubscriptionLog): void } };
function marbleAssert<T = string>(
  source: Array<TestMessage<T>> | Readonly<Array<TestMessage<T>>>
): { to: { equal(expected: Array<TestMessage<T>> | Readonly<Array<TestMessage<T>>>): void } };
function marbleAssert<T = string>(
  source: SubscriptionLog | Array<TestMessage<T>> | Readonly<Array<TestMessage<T>>>
): { to: { equal(expected: object): void } } {
  const isSourceArray = Array.isArray(source);
  const isSourceSubscription = source instanceof SubscriptionLog;

  if (!isSourceArray && !isSourceSubscription) {
    throw new Error('Source is neither array nor SubscriptionLog, cannot assert');
  }

  return {
    to: {
      equal: isSourceSubscription
        ? subscriptionMarbleAssert(source as SubscriptionLog)
        : observableMarbleAssert(source as any)
    }
  };
}

export { marbleAssert, constructSubscriptionMarble };
