import { of } from 'rxjs';
import { calculateSubscriptionFrame } from '../../src/scheduler/calculateSubscriptionFrame';
import { createTestScheduler } from '../../src/scheduler/createTestScheduler';

describe('calculateSubscriptionFrame', () => {
  it('should return immediate subscription without subscription token', () => {
    const { subscribedFrame, unsubscribedFrame } = calculateSubscriptionFrame(of(''), '---!', 1);

    expect(subscribedFrame).toEqual(0);
    expect(unsubscribedFrame).toEqual(3);
  });

  it('should preserve subscription frame with hot observable', () => {
    const { hot } = createTestScheduler(false, 1, 1000, false);
    const value = hot('');

    const { subscribedFrame, unsubscribedFrame } = calculateSubscriptionFrame(value, '--^---!', 1);

    expect(subscribedFrame).toEqual(2);
    expect(unsubscribedFrame).toEqual(6);
  });

  it('should allow custom frameTimeFactor', () => {
    const { hot } = createTestScheduler(false, 1, 1000, false);
    const value = hot('');

    const { subscribedFrame, unsubscribedFrame } = calculateSubscriptionFrame(value, '--^---!', 10);

    expect(subscribedFrame).toEqual(20);
    expect(unsubscribedFrame).toEqual(60);
  });

  it('should return adjusted subscription frame with cold observable', () => {
    const { cold } = createTestScheduler(false, 1, 1000, false);
    const hot = cold('');

    const { subscribedFrame, unsubscribedFrame } = calculateSubscriptionFrame(hot, '--^---!', 1);

    expect(subscribedFrame).toEqual(0);
    expect(unsubscribedFrame).toEqual(4);
  });

  it('should preserve immediate subscription with cold observable', () => {
    const { cold } = createTestScheduler(false, 1, 1000, false);
    const hot = cold('');

    const { subscribedFrame, unsubscribedFrame } = calculateSubscriptionFrame(hot, '^---!', 1);

    expect(subscribedFrame).toEqual(0);
    expect(unsubscribedFrame).toEqual(4);
  });

  it('should return subscription only frame with hot obsrevable', () => {
    const { hot } = createTestScheduler(false, 1, 1000, false);
    const value = hot('');

    const { subscribedFrame, unsubscribedFrame } = calculateSubscriptionFrame(value, '--^---', 1);

    expect(subscribedFrame).toEqual(2);
    expect(unsubscribedFrame).toEqual(Number.POSITIVE_INFINITY);
  });

  it('should return adjusted subscription only frame with cold obsrevable', () => {
    const { cold } = createTestScheduler(false, 1, 1000, false);
    const hot = cold('');

    const { subscribedFrame, unsubscribedFrame } = calculateSubscriptionFrame(hot, '--^---', 1);

    expect(subscribedFrame).toEqual(0);
    expect(unsubscribedFrame).toEqual(Number.POSITIVE_INFINITY);
  });

  it('should throw when source is neither hot nor cold', () => {
    expect(() => calculateSubscriptionFrame(of(''), '-^-!', 1)).toThrow();
  });
});
