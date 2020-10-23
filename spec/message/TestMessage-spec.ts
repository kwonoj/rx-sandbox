import { expect } from 'chai';
import { complete, error, next, subscribe, TestMessageValue } from '../../src/message/TestMessage';

//tslint:disable no-var-requires no-require-imports
const {
  COMPLETE_NOTIFICATION,
  errorNotification,
  nextNotification,
}: typeof import('rxjs/dist/types/internal/Notification') = require('rxjs/dist/cjs/internal/Notification');
//tslint:enable no-var-requires no-require-imports

describe('TestMessageValue', () => {
  it('should create metadata', () => {
    const notification = nextNotification('meh');

    const message = new TestMessageValue(10, notification);

    expect(message.frame).to.equal(10);
    expect(message.notification).to.deep.equal(notification);
  });

  describe('utility function', () => {
    it('should create next', () => {
      const value = next(10, 'meh');

      expect(value).to.deep.equal(new TestMessageValue(10, nextNotification('meh')));
    });

    it('should create error', () => {
      const errorValue = error(10, 'meh');

      expect(errorValue).to.deep.equal(new TestMessageValue(10, errorNotification('meh')));
    });

    it('should create complete', () => {
      const completeValue = complete(10);

      expect(completeValue).to.deep.equal(new TestMessageValue(10, COMPLETE_NOTIFICATION));
    });

    it('should create subscription log', () => {
      const withUnsub = subscribe(10, 20);
      const withoutSub = subscribe(10);
      const emptySub = subscribe();

      expect(withUnsub).to.deep.equal(subscribe(10, 20));
      expect(withoutSub).to.deep.equal(subscribe(10, Number.POSITIVE_INFINITY));
      expect(emptySub).to.deep.equal(subscribe(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY));
    });
  });
});
