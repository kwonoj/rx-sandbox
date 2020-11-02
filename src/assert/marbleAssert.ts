import { SubscriptionLog } from 'rxjs/internal/testing/SubscriptionLog';
import { TestMessage } from '../message/TestMessage';
import { constructObservableMarble } from './constructObservableMarble';
import { constructSubscriptionMarble } from './constructSubscriptionMarble';
const { matcherHint, printExpected, printReceived } = require('jest-matcher-utils'); //tslint:disable-line:no-require-imports no-var-requires
const { default: matchers } = require('expect/build/matchers'); //tslint:disable-line:no-require-imports no-var-requires
const toEqualAssert = matchers.toEqual.bind({ expand: false });

const subscriptionMarbleAssert = (source: Array<SubscriptionLog>) => (expected: Array<SubscriptionLog>) => {
  const asserted = toEqualAssert(source, expected);

  if (!asserted.pass) {
    const length = source.length > expected.length ? source.length : expected.length;
    let description = `
${matcherHint(' to equal ')}
    `;

    for (let idx = 0; idx < length; idx++) {
      const sourceMarble = !!source[idx]
        ? constructSubscriptionMarble(source[idx])
        : { marbleString: '', frameString: '' };
      const expectedMarble = !!expected[idx]
        ? constructSubscriptionMarble(expected[idx])
        : { marbleString: '', frameString: '' };

      if (toEqualAssert(sourceMarble, expectedMarble).pass) {
        continue;
      }

      description += `

${printReceived(`Source:   ${sourceMarble.marbleString}`)}
${printReceived(`          ${sourceMarble.frameString}`)}
${printExpected(`Expected: ${expectedMarble.marbleString}`)}
${printExpected(`          ${expectedMarble.frameString}`)}
      `;
    }
    description += `
${asserted.message()}
`;
    throw new Error(description);
  }
};

const observableMarbleAssert = <T = string>(source: Array<TestMessage<T>> | Readonly<Array<TestMessage<T>>>) => (
  expected: Array<TestMessage<T>> | Readonly<Array<TestMessage<T>>>
) => {
  if (!Array.isArray(expected)) {
    throw new Error('Expected value is not array');
  }

  //polymorphic picks up observablemarbleassert first when empty array, manually falls back
  //if expected is subscriptionlog
  if ((expected as any).every((x: any) => x instanceof SubscriptionLog)) {
    subscriptionMarbleAssert(source as any)(expected as any);
    return;
  }

  const sourceMarble = constructObservableMarble(source);
  const expectedMarble = constructObservableMarble(expected);

  const asserted = toEqualAssert(source, expected);

  if (!asserted.pass) {
    const description = `
${printReceived(`Source:   ${sourceMarble}`)}
${printExpected(`Expected: ${expectedMarble}`)}

${asserted.message()}
    `;
    throw new Error(description);
  }
};

function marbleAssert<T = string>(
  source: Array<TestMessage<T | Array<TestMessage<T>>>> | Readonly<Array<TestMessage<T | Array<TestMessage<T>>>>>
): {
  to: {
    equal(
      expected: TestMessage<T | Array<TestMessage<T>>> | Readonly<Array<TestMessage<T | Array<TestMessage<T>>>>>
    ): void;
  };
};
function marbleAssert<T = void>(
  source: Array<SubscriptionLog>
): { to: { equal(expected: Array<SubscriptionLog>): void } };
function marbleAssert<T = string>(
  source:
    | Array<SubscriptionLog>
    | Array<TestMessage<T | Array<TestMessage<T>>>>
    | Readonly<Array<TestMessage<T | Array<TestMessage<T>>>>>
): { to: { equal(expected: object): void } } {
  const isSourceArray = Array.isArray(source);
  if (!isSourceArray) {
    throw new Error('Cannot assert non array');
  }

  const isSourceSubscription = source.length > 0 && (source as Array<any>).every((v) => v instanceof SubscriptionLog);

  return {
    to: {
      equal: isSourceSubscription ? subscriptionMarbleAssert(source as any) : observableMarbleAssert(source as any),
    },
  };
}

export { marbleAssert, constructSubscriptionMarble };
