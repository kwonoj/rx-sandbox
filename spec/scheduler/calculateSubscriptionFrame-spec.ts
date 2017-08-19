import { expect } from 'chai';
import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';
import { calculateSubscriptionFrame } from '../../src/scheduler/calculateSubscriptionFrame';
import { TestScheduler } from '../../src/scheduler/TestScheduler';

describe('calculateSubscriptionFrame', () => {
  it('should return immediate subscription without subscription token', () => {
    const { subscribedFrame, unsubscribedFrame } = calculateSubscriptionFrame(Observable.of(''), '---!', 1);

    expect(subscribedFrame).to.equal(0);
    expect(unsubscribedFrame).to.equal(3);
  });

  it('should preserve subscription frame with hot observable', () => {
    const scheduler = new TestScheduler();
    const hot = scheduler.createHotObservable('');

    const { subscribedFrame, unsubscribedFrame } = calculateSubscriptionFrame(hot, '--^---!', 1);

    expect(subscribedFrame).to.equal(2);
    expect(unsubscribedFrame).to.equal(6);
  });

  it('should allow custom frameTimeFactor', () => {
    const scheduler = new TestScheduler();
    const hot = scheduler.createHotObservable('');

    const { subscribedFrame, unsubscribedFrame } = calculateSubscriptionFrame(hot, '--^---!', 10);

    expect(subscribedFrame).to.equal(20);
    expect(unsubscribedFrame).to.equal(60);
  });

  it('should return adjusted subscription frame with cold observable', () => {
    const scheduler = new TestScheduler();
    const hot = scheduler.createColdObservable('');

    const { subscribedFrame, unsubscribedFrame } = calculateSubscriptionFrame(hot, '--^---!', 1);

    expect(subscribedFrame).to.equal(0);
    expect(unsubscribedFrame).to.equal(4);
  });

  it('should preserve immediate subscription with cold observable', () => {
    const scheduler = new TestScheduler();
    const hot = scheduler.createColdObservable('');

    const { subscribedFrame, unsubscribedFrame } = calculateSubscriptionFrame(hot, '^---!', 1);

    expect(subscribedFrame).to.equal(0);
    expect(unsubscribedFrame).to.equal(4);
  });

  it('should return subscription only frame with hot obsrevable', () => {
    const scheduler = new TestScheduler();
    const hot = scheduler.createHotObservable('');

    const { subscribedFrame, unsubscribedFrame } = calculateSubscriptionFrame(hot, '--^---', 1);

    expect(subscribedFrame).to.equal(2);
    expect(unsubscribedFrame).to.equal(Number.POSITIVE_INFINITY);
  });

  it('should return adjusted subscription only frame with cold obsrevable', () => {
    const scheduler = new TestScheduler();
    const hot = scheduler.createColdObservable('');

    const { subscribedFrame, unsubscribedFrame } = calculateSubscriptionFrame(hot, '--^---', 1);

    expect(subscribedFrame).to.equal(0);
    expect(unsubscribedFrame).to.equal(Number.POSITIVE_INFINITY);
  });

  it('should throw when source is neither hot nor cold', () => {
    expect(() => calculateSubscriptionFrame(Observable.of(''), '-^-!', 1)).to.throw();
  });
});
