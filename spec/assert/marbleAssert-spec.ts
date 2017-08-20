import { expect } from 'chai';
import { SubscriptionLog } from 'rxjs/testing/SubscriptionLog';
import { marbleAssert } from '../../src/assert/marbleAssert';

describe('marbleAssert', () => {
  it('should throw if source is neither array nor SubscriptionLog', () => {
    expect(() => marbleAssert(1 as any)).to.throw();
  });

  describe('TestMessage', () => {
    //noop
  });

  describe('SubscriptionLog', () => {
    it(`should throw if expected value isn't subscription log`, () => {
      expect(() => marbleAssert(new SubscriptionLog(0, 0)).to.equal(1 as any)).to.throw();
    });
  });
});
