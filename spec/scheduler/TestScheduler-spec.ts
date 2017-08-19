import { expect } from 'chai';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/windowCount';
import { ColdObservable } from 'rxjs/testing/ColdObservable';
import { HotObservable } from 'rxjs/testing/HotObservable';
import { SubscriptionLog } from 'rxjs/testing/SubscriptionLog';
import { TestMessage } from '../../src/index';
import { parseObservableMarble } from '../../src/marbles/parseObservableMarble';
import { complete, error, next } from '../../src/message/TestMessageValue';
import { TestScheduler } from '../../src/scheduler/TestScheduler';

describe('TestScheduler', () => {
  describe('hotObservable', () => {
    it('should create hot observable via TestMessage', () => {
      const scheduler = new TestScheduler();
      const messages: Array<TestMessage<string>> = [next(10, 'meh'), complete(20)];

      const value = scheduler.createHotObservable(messages);

      expect(value).to.be.instanceOf(HotObservable);
      expect(value.messages).to.deep.equal(messages);
    });

    it('should create hot observable via marble diagram', () => {
      const scheduler = new TestScheduler();
      const value = scheduler.createHotObservable('---a---|');

      const expected: Array<TestMessage<string>> = [next(3, 'a'), complete(7)];

      expect(value).to.be.instanceOf(HotObservable);
      expect(value.messages).to.deep.equal(expected);
    });

    it('should create hot observale via marble with custom value', () => {
      const scheduler = new TestScheduler();
      const value = scheduler.createHotObservable('---a---|', {
        a: 'meh'
      });

      const expected: Array<TestMessage<string>> = [next(3, 'meh'), complete(7)];

      expect(value).to.be.instanceOf(HotObservable);
      expect(value.messages).to.deep.equal(expected);
    });

    it('should create hot observable via marble with error', () => {
      const scheduler = new TestScheduler();
      const value = scheduler.createHotObservable('---a---#');

      const expected: Array<TestMessage<string>> = [next(3, 'a'), error(7, '#')];

      expect(value).to.be.instanceOf(HotObservable);
      expect(value.messages).to.deep.equal(expected);
    });

    it('should create hot observable via marble with custom error', () => {
      const scheduler = new TestScheduler();
      const value = scheduler.createHotObservable('---a---#', null, 'meh');

      const expected: Array<TestMessage<string>> = [next(3, 'a'), error(7, 'meh')];

      expect(value).to.be.instanceOf(HotObservable);
      expect(value.messages).to.deep.equal(expected);
    });

    it('should honor custom frameTimeFactor', () => {
      const scheduler = new TestScheduler(false, 10);

      const value = scheduler.createHotObservable('---a---|');

      const expected: Array<TestMessage<string>> = [next(30, 'a'), complete(70)];

      expect(value).to.be.instanceOf(HotObservable);
      expect(value.messages).to.deep.equal(expected);
    });
  });

  describe('coldObservable', () => {
    it('should create cold observable via TestMessage', () => {
      const scheduler = new TestScheduler();
      const messages: Array<TestMessage<string>> = [next(10, 'meh'), complete(20)];

      const value = scheduler.createColdObservable(messages);

      expect(value).to.be.instanceOf(ColdObservable);
      expect(value.messages).to.deep.equal(messages);
    });

    it('should create hot observable via marble diagram', () => {
      const scheduler = new TestScheduler();
      const value = scheduler.createColdObservable('---a---|');

      const expected: Array<TestMessage<string>> = [next(3, 'a'), complete(7)];

      expect(value).to.be.instanceOf(ColdObservable);
      expect(value.messages).to.deep.equal(expected);
    });

    it('should create hot observale via marble with custom value', () => {
      const scheduler = new TestScheduler();
      const value = scheduler.createColdObservable('---a---|', {
        a: 'meh'
      });

      const expected: Array<TestMessage<string>> = [next(3, 'meh'), complete(7)];

      expect(value).to.be.instanceOf(ColdObservable);
      expect(value.messages).to.deep.equal(expected);
    });

    it('should create hot observable via marble with error', () => {
      const scheduler = new TestScheduler();
      const value = scheduler.createColdObservable('---a---#');

      const expected: Array<TestMessage<string>> = [next(3, 'a'), error(7, '#')];

      expect(value).to.be.instanceOf(ColdObservable);
      expect(value.messages).to.deep.equal(expected);
    });

    it('should create hot observable via marble with custom error', () => {
      const scheduler = new TestScheduler();
      const value = scheduler.createColdObservable('---a---#', null, 'meh');

      const expected: Array<TestMessage<string>> = [next(3, 'a'), error(7, 'meh')];

      expect(value).to.be.instanceOf(ColdObservable);
      expect(value.messages).to.deep.equal(expected);
    });

    it('should honor custom frameTimeFactor', () => {
      const scheduler = new TestScheduler(false, 10);

      const value = scheduler.createColdObservable('---a---|');

      const expected: Array<TestMessage<string>> = [next(30, 'a'), complete(70)];

      expect(value).to.be.instanceOf(ColdObservable);
      expect(value.messages).to.deep.equal(expected);
    });

    it('should throw when marble includes unsupported token', () => {
      const scheduler = new TestScheduler();

      expect(() => scheduler.createColdObservable('----^')).to.throw();
    });
  });

  describe('getMessages', () => {
    it('should generate messages from observable having hot observable source', () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x'), next(7, 'x'), complete(11)];
      const scheduler = new TestScheduler();

      const e1 = scheduler.createHotObservable('---1---2---|');
      const messages = scheduler.getMessages(e1.mapTo('x'));

      expect(messages).to.be.empty;
      scheduler.flush();

      expect(messages).to.deep.equal(expected);
      expect(e1.subscriptions).to.deep.equal([new SubscriptionLog(0, 11)]);
    });

    it('should able to autoflush with hot observable source', () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x'), next(7, 'x'), complete(11)];
      const scheduler = new TestScheduler(true);

      const e1 = scheduler.createHotObservable('---1---2---|');
      const messages = scheduler.getMessages(e1.mapTo('x'));

      expect(messages).to.deep.equal(expected);
      expect(e1.subscriptions).to.deep.equal([new SubscriptionLog(0, 11)]);
    });

    it('should throw when autoflush attempted multiple times', () => {
      const scheduler = new TestScheduler(true);

      const e1 = scheduler.createHotObservable('---1---2---|');
      scheduler.getMessages(e1.mapTo('x'));

      expect(() => scheduler.getMessages(e1.mapTo('x'))).to.throw();
    });

    it('should generate messages from observable having hot observable source with error', () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x'), next(7, 'x'), error(11, '#')];
      const scheduler = new TestScheduler();

      const e1 = scheduler.createHotObservable('---1---2---#');
      const messages = scheduler.getMessages(e1.mapTo('x'));

      expect(messages).to.be.empty;
      scheduler.flush();

      expect(messages).to.deep.equal(expected);
      expect(e1.subscriptions).to.deep.equal([new SubscriptionLog(0, 11)]);
    });

    it('should generate messages from observable having cold observable source', () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x'), next(7, 'x'), complete(11)];
      const scheduler = new TestScheduler();

      const e1 = scheduler.createColdObservable('---1---2---|');
      const messages = scheduler.getMessages(e1.mapTo('x'));

      expect(messages).to.be.empty;
      scheduler.flush();

      expect(messages).to.deep.equal(expected);
      expect(e1.subscriptions).to.deep.equal([new SubscriptionLog(0, 11)]);
    });

    it('should able to autoflush with cold observable source', () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x'), next(7, 'x'), complete(11)];
      const scheduler = new TestScheduler(true);

      const e1 = scheduler.createColdObservable('---1---2---|');
      const messages = scheduler.getMessages(e1.mapTo('x'));

      expect(messages).to.deep.equal(expected);
      expect(e1.subscriptions).to.deep.equal([new SubscriptionLog(0, 11)]);
    });

    it('should generate messages from observable having cold observable source with error', () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x'), next(7, 'x'), error(11, '#')];
      const scheduler = new TestScheduler();

      const e1 = scheduler.createColdObservable('---1---2---#');
      const messages = scheduler.getMessages(e1.mapTo('x'));

      expect(messages).to.be.empty;
      scheduler.flush();

      expect(messages).to.deep.equal(expected);
      expect(e1.subscriptions).to.deep.equal([new SubscriptionLog(0, 11)]);
    });

    it('should materialize inner observable with cold observable source', () => {
      const scheduler = new TestScheduler();
      const expected: Array<TestMessage<Readonly<TestMessage<string | TestMessage<string>[]>[]>>> = [
        next(0, parseObservableMarble<string>(' ---a---b---(c|)')),
        next(11, parseObservableMarble<string>('           ----d---|')),
        complete(19)
      ];

      const source = scheduler.createColdObservable('---a---b---c---d---|');

      const messages = scheduler.getMessages(source.windowCount(3));
      expect(messages).to.be.empty;

      scheduler.flush();
      expect(messages).to.deep.equal(expected);
    });

    it('should materialize inner observable with cold observable source with error', () => {
      const scheduler = new TestScheduler();
      const expected: Array<TestMessage<Readonly<TestMessage<string | TestMessage<string>[]>[]>>> = [
        next(0, parseObservableMarble<string>(' ---a---b---(c|)')),
        next(11, parseObservableMarble<string>('           ----#')),
        error(15, '#')
      ];

      const source = scheduler.createColdObservable('---a---b---c---#');

      const messages = scheduler.getMessages(source.windowCount(3));
      expect(messages).to.be.empty;

      scheduler.flush();
      expect(messages).to.deep.equal(expected);
    });

    it('should materialize inner observable with hot observable source', () => {
      const scheduler = new TestScheduler();
      const expected: Array<TestMessage<Readonly<TestMessage<string | TestMessage<string>[]>[]>>> = [
        next(0, parseObservableMarble<string>(' ---a---b---(c|)')),
        next(11, parseObservableMarble<string>('           ----d---|')),
        complete(19)
      ];

      const source = scheduler.createHotObservable('---a---b---c---d---|');

      const messages = scheduler.getMessages(source.windowCount(3));
      expect(messages).to.be.empty;

      scheduler.flush();
      expect(messages).to.deep.equal(expected);
    });

    it('should materialize inner observable with hot observable source with error', () => {
      const scheduler = new TestScheduler();
      const expected: Array<TestMessage<Readonly<TestMessage<string | TestMessage<string>[]>[]>>> = [
        next(0, parseObservableMarble<string>(' ---a---b---(c|)')),
        next(11, parseObservableMarble<string>('           ----#')),
        error(15, '#')
      ];

      const source = scheduler.createHotObservable('---a---b---c---#');

      const messages = scheduler.getMessages(source.windowCount(3));
      expect(messages).to.be.empty;

      scheduler.flush();
      expect(messages).to.deep.equal(expected);
    });

    it('should support subscription with cold observable source', () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x')];
      const scheduler = new TestScheduler();

      const e1 = scheduler.createColdObservable('---1---2---|');
      const sub = '                              ------^---!';
      //actual subscription:                           ---1-

      const messages = scheduler.getMessages(e1.mapTo('x'), sub);

      expect(messages).to.be.empty;
      scheduler.flush();

      expect(messages).to.deep.equal(expected);
      expect(e1.subscriptions).to.deep.equal([new SubscriptionLog(0, 4)]);
    });

    it('should support subscription with hot observable source', () => {
      const expected: Array<TestMessage<string>> = [next(7, 'x')];
      const scheduler = new TestScheduler();

      const e1 = scheduler.createHotObservable('---1---2---|');
      const sub = '                             ------^---!';
      const messages = scheduler.getMessages(e1.mapTo('x'), sub);

      expect(messages).to.be.empty;
      scheduler.flush();

      expect(messages).to.deep.equal(expected);
      expect(e1.subscriptions).to.deep.equal([new SubscriptionLog(6, 10)]);
    });
  });
});
