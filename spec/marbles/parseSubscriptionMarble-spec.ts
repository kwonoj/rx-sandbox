import { expect } from 'chai';
import { SubscriptionLog } from 'rxjs/testing/SubscriptionLog';
import { parseSubscriptionMarble } from '../../src/marbles/parseSubscriptionMarble';

describe('parseSubscriptionMarble', () => {
  it('should parse subscription', () => {
    const marble = '--^-----';

    const subscription = parseSubscriptionMarble(marble);
    const expected = new SubscriptionLog(2);

    expect(subscription).to.deep.equal(expected);
  });

  it('should parse subscription with unsubscription', () => {
    const marble = '--^-----!';

    const subscription = parseSubscriptionMarble(marble);
    const expected = new SubscriptionLog(2, 8);

    expect(subscription).to.deep.equal(expected);
  });

  it('should support custom timeframe value', () => {
    const marble = '--^-----!';

    const subscription = parseSubscriptionMarble(marble, 10);
    const expected = new SubscriptionLog(20, 80);

    expect(subscription).to.deep.equal(expected);
  });

  it('should allow whitespace', () => {
    const marble = '-- ^   -----!';

    const subscription = parseSubscriptionMarble(marble);
    const expected = new SubscriptionLog(2, 8);

    expect(subscription).to.deep.equal(expected);
  });

  it('should allow expanding timeframe', () => {
    const marble = '--...14...^-----!';

    const subscription = parseSubscriptionMarble(marble);
    const expected = new SubscriptionLog(16, 22);

    expect(subscription).to.deep.equal(expected);
  });

  it('should return infinite subscription with null', () => {
    const subscription = parseSubscriptionMarble(null);

    expect(subscription).to.deep.equal(new SubscriptionLog(Number.POSITIVE_INFINITY));
  });

  it('should allow simultaneous value', () => {
    //             '-v   --^---v   ---!'
    const marble = '-(ab)--^---(cd)---!';

    const subscription = parseSubscriptionMarble(marble);
    const expected = new SubscriptionLog(4, 12);

    expect(subscription).to.deep.equal(expected);
  });

  it('should throw when try to nest simultaneous value', () => {
    const marble = '-----(a(b|))';

    expect(() => parseSubscriptionMarble(marble)).to.throw();
  });

  it('should throw when try to set timeframe in simultaneous value', () => {
    const marble = '-------(a-b)';

    expect(() => parseSubscriptionMarble(marble)).to.throw();
  });

  it('should throw if expanding timeframe does not contain values', () => {
    const marble = '----......----a----';

    expect(() => parseSubscriptionMarble(marble)).to.throw();
  });
});
