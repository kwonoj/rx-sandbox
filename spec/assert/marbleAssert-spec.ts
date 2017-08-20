import { expect } from 'chai';
import { SubscriptionLog } from 'rxjs/testing/SubscriptionLog';
import { marbleAssert } from '../../src/assert/marbleAssert';

describe('marbleAssert', () => {
  it('should throw if source is neither array nor SubscriptionLog', () => {
    expect(() => marbleAssert(1 as any)).to.throw();
  });

  describe('TestMessage', () => {
    it(`should throw if expected value isn't array`, () => {
      expect(() => marbleAssert([]).to.equal(new SubscriptionLog(0) as any)).to.throw();
    });

    it('should pass hot observables', () => {
      //noop
    });

    it('should pass cold observable', () => {
      //noop
    });

    it('should pass hot and cold observables', () => {
      //noop
    });

    it('should pass observable with noop', () => {
      //noop
    });

    it('should pass observable with groups', () => {
      //noop
    });

    it('should pass observable with expand', () => {
      //noop
    });

    it('should pass observable with complete', () => {
      //noop
    });

    it('should pass observable with error', () => {
      //noop
    });

    it('should pass observable with non completion', () => {
      //noop
    });

    it('should pass hot observable with subscription, emit before sub', () => {
      //noop
    });

    it('should pass hot observable with subscription, without emit before sub', () => {
      //noop
    });
  });

  describe('SubscriptionLog', () => {
    it(`should throw if expected value isn't subscription log`, () => {
      expect(() => marbleAssert(new SubscriptionLog(0, 0)).to.equal([] as any)).to.throw();
    });

    it('should pass if subscription matches', () => {
      const source = new SubscriptionLog(10);

      expect(() => marbleAssert(source).to.equal(source)).to.not.throw();
    });

    it('should pass if subscription with unsubscription matches', () => {
      const source = new SubscriptionLog(10, 45);

      expect(() => marbleAssert(source).to.equal(source)).to.not.throw();
    });

    it('should pass if unsubscription matches', () => {
      const source = new SubscriptionLog(Number.POSITIVE_INFINITY, 20);

      expect(() => marbleAssert(source).to.equal(source)).to.not.throw();
    });

    it('should pass if subscription is empty', () => {
      const source = new SubscriptionLog(Number.POSITIVE_INFINITY);

      expect(() => marbleAssert(source).to.equal(source)).to.not.throw();
    });

    it('should assert if subscription unmatches', () => {
      const source = new SubscriptionLog(10);
      const expected = new SubscriptionLog(20);

      expect(() => marbleAssert(source).to.equal(expected)).to.throw();
    });

    it('should assert if subscription with unsubscription unmatches', () => {
      const source = new SubscriptionLog(10, 45);
      const expected = new SubscriptionLog(12, 46);

      expect(() => marbleAssert(source).to.equal(expected)).to.throw();
    });

    it('should assert if subscription unmatches with unsubscription', () => {
      const source = new SubscriptionLog(10, 45);
      const expected = new SubscriptionLog(12, 45);

      expect(() => marbleAssert(source).to.equal(expected)).to.throw();
    });

    it('should assert if unsubscription with subscription unmatches', () => {
      const source = new SubscriptionLog(10, 45);
      const expected = new SubscriptionLog(10, 46);

      expect(() => marbleAssert(source).to.equal(expected)).to.throw();
    });

    it('should assert if unsubscription unmatches', () => {
      const source = new SubscriptionLog(Number.POSITIVE_INFINITY, 20);
      const expected = new SubscriptionLog(Number.POSITIVE_INFINITY, 30);

      expect(() => marbleAssert(source).to.equal(expected)).to.throw();
    });
  });
});
