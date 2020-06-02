import { expect } from 'chai';
import { mapTo, windowCount } from 'rxjs/operators';
import { parseObservableMarble } from '../../src/marbles/parseObservableMarble';
import { complete, error, next, subscribe, TestMessage } from '../../src/message/TestMessage';
import { TestScheduler } from '../../src/scheduler/TestScheduler';

//tslint:disable no-var-requires no-require-imports
const {
  AsyncAction,
}: {
  AsyncAction: typeof import('rxjs/dist/types/internal/scheduler/AsyncAction').AsyncAction;
} = require('rxjs/dist/cjs/internal/scheduler/AsyncAction');
const {
  ColdObservable,
}: {
  ColdObservable: typeof import('rxjs/dist/types/internal/testing/ColdObservable').ColdObservable;
} = require('rxjs/dist/cjs/internal/testing/ColdObservable');
const {
  HotObservable,
}: {
  HotObservable: typeof import('rxjs/dist/types/internal/testing/HotObservable').HotObservable;
} = require('rxjs/dist/cjs/internal/testing/HotObservable');
//tslint:enable no-var-requires no-require-imports

describe('TestScheduler', () => {
  describe('hotObservable', () => {
    it('should create hot observable via TestMessage', () => {
      const scheduler = new TestScheduler(false, 1, 1000);
      const messages: Array<TestMessage<string>> = [next(10, 'meh'), complete(20)];

      const value = scheduler.createHotObservable(messages);

      expect(value).to.be.instanceOf(HotObservable);
      expect(value.messages).to.deep.equal(messages);
    });

    it('should create hot observable via marble diagram', () => {
      const scheduler = new TestScheduler(false, 1, 1000);
      const value = scheduler.createHotObservable('---a---|');

      const expected: Array<TestMessage<string>> = [next(3, 'a'), complete(7)];

      expect(value).to.be.instanceOf(HotObservable);
      expect(value.messages).to.deep.equal(expected);
    });

    it('should create hot observale via marble with custom value', () => {
      const scheduler = new TestScheduler(false, 1, 1000);
      const value = scheduler.createHotObservable('---a---|', {
        a: 'meh',
      });

      const expected: Array<TestMessage<string>> = [next(3, 'meh'), complete(7)];

      expect(value).to.be.instanceOf(HotObservable);
      expect(value.messages).to.deep.equal(expected);
    });

    it('should create hot observable via marble with error', () => {
      const scheduler = new TestScheduler(false, 1, 1000);
      const value = scheduler.createHotObservable('---a---#');

      const expected: Array<TestMessage<string>> = [next(3, 'a'), error(7, '#')];

      expect(value).to.be.instanceOf(HotObservable);
      expect(value.messages).to.deep.equal(expected);
    });

    it('should create hot observable via marble with custom error', () => {
      const scheduler = new TestScheduler(false, 1, 1000);
      const value = scheduler.createHotObservable('---a---#', null, 'meh');

      const expected: Array<TestMessage<string>> = [next(3, 'a'), error(7, 'meh')];

      expect(value).to.be.instanceOf(HotObservable);
      expect(value.messages).to.deep.equal(expected);
    });

    it('should honor custom frameTimeFactor', () => {
      const scheduler = new TestScheduler(false, 10, 1000);

      const value = scheduler.createHotObservable('---a---|');

      const expected: Array<TestMessage<string>> = [next(30, 'a'), complete(70)];

      expect(value).to.be.instanceOf(HotObservable);
      expect(value.messages).to.deep.equal(expected);
    });
  });

  describe('coldObservable', () => {
    it('should create cold observable via TestMessage', () => {
      const scheduler = new TestScheduler(false, 1, 1000);
      const messages: Array<TestMessage<string>> = [next(10, 'meh'), complete(20)];

      const value = scheduler.createColdObservable(messages);

      expect(value).to.be.instanceOf(ColdObservable);
      expect(value.messages).to.deep.equal(messages);
    });

    it('should create cold observable via marble diagram', () => {
      const scheduler = new TestScheduler(false, 1, 1000);
      const value = scheduler.createColdObservable('---a---|');

      const expected: Array<TestMessage<string>> = [next(3, 'a'), complete(7)];

      expect(value).to.be.instanceOf(ColdObservable);
      expect(value.messages).to.deep.equal(expected);
    });

    it('should create cold observale via marble with custom value', () => {
      const scheduler = new TestScheduler(false, 1, 1000);
      const value = scheduler.createColdObservable('---a---|', {
        a: 'meh',
      });

      const expected: Array<TestMessage<string>> = [next(3, 'meh'), complete(7)];

      expect(value).to.be.instanceOf(ColdObservable);
      expect(value.messages).to.deep.equal(expected);
    });

    it('should create cold observable via marble with error', () => {
      const scheduler = new TestScheduler(false, 1, 1000);
      const value = scheduler.createColdObservable('---a---#');

      const expected: Array<TestMessage<string>> = [next(3, 'a'), error(7, '#')];

      expect(value).to.be.instanceOf(ColdObservable);
      expect(value.messages).to.deep.equal(expected);
    });

    it('should create cold observable via marble with custom error', () => {
      const scheduler = new TestScheduler(false, 1, 1000);
      const value = scheduler.createColdObservable('---a---#', null, 'meh');

      const expected: Array<TestMessage<string>> = [next(3, 'a'), error(7, 'meh')];

      expect(value).to.be.instanceOf(ColdObservable);
      expect(value.messages).to.deep.equal(expected);
    });

    it('should honor custom frameTimeFactor', () => {
      const scheduler = new TestScheduler(false, 10, 1000);

      const value = scheduler.createColdObservable('---a---|');

      const expected: Array<TestMessage<string>> = [next(30, 'a'), complete(70)];

      expect(value).to.be.instanceOf(ColdObservable);
      expect(value.messages).to.deep.equal(expected);
    });

    it('should throw when marble includes unsupported token', () => {
      const scheduler = new TestScheduler(false, 1, 1000);

      expect(() => scheduler.createColdObservable('----^')).to.throw();
    });
  });

  describe('getMessages', () => {
    it('should generate messages from observable having hot observable source', () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x'), next(7, 'x'), complete(11)];
      const scheduler = new TestScheduler(false, 1, 1000);

      const e1 = scheduler.createHotObservable('---1---2---|');
      const messages = scheduler.getMessages(e1.pipe(mapTo('x')));

      expect(messages).to.be.empty;
      scheduler.flush();

      expect(messages).to.deep.equal(expected);
      expect(e1.subscriptions).to.deep.equal([subscribe(0, 11)]);
    });

    it('should able to autoflush with hot observable source', () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x'), next(7, 'x'), complete(11)];
      const scheduler = new TestScheduler(true, 1, 1000);

      const e1 = scheduler.createHotObservable('---1---2---|');
      const messages = scheduler.getMessages(e1.pipe(mapTo('x')));

      expect(messages).to.deep.equal(expected);
      expect(e1.subscriptions).to.deep.equal([subscribe(0, 11)]);
    });

    it('should throw when autoflush attempted multiple times', () => {
      const scheduler = new TestScheduler(true, 1, 1000);

      const e1 = scheduler.createHotObservable('---1---2---|');
      scheduler.getMessages(e1.pipe(mapTo('x')));

      expect(() => scheduler.getMessages(e1.pipe(mapTo('x')))).to.throw();
    });

    it('should ignore values over max frames', () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x')];
      const scheduler = new TestScheduler(true, 1, 5);

      const e1 = scheduler.createHotObservable('---1---2---|');
      const messages = scheduler.getMessages(e1.pipe(mapTo('x')));

      expect(messages).to.deep.equal(expected);
    });

    it('should generate messages from observable having hot observable source with error', () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x'), next(7, 'x'), error(11, '#')];
      const scheduler = new TestScheduler(false, 1, 1000);

      const e1 = scheduler.createHotObservable('---1---2---#');
      const messages = scheduler.getMessages(e1.pipe(mapTo('x')));

      expect(messages).to.be.empty;
      scheduler.flush();

      expect(messages).to.deep.equal(expected);
      expect(e1.subscriptions).to.deep.equal([subscribe(0, 11)]);
    });

    it('should generate messages from observable having cold observable source', () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x'), next(7, 'x'), complete(11)];
      const scheduler = new TestScheduler(false, 1, 1000);

      const e1 = scheduler.createColdObservable('---1---2---|');
      const messages = scheduler.getMessages(e1.pipe(mapTo('x')));

      expect(messages).to.be.empty;
      scheduler.flush();

      expect(messages).to.deep.equal(expected);
      expect(e1.subscriptions).to.deep.equal([subscribe(0, 11)]);
    });

    it('should able to autoflush with cold observable source', () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x'), next(7, 'x'), complete(11)];
      const scheduler = new TestScheduler(true, 1, 1000);

      const e1 = scheduler.createColdObservable('---1---2---|');
      const messages = scheduler.getMessages(e1.pipe(mapTo('x')));

      expect(messages).to.deep.equal(expected);
      expect(e1.subscriptions).to.deep.equal([subscribe(0, 11)]);
    });

    it('should generate messages from observable having cold observable source with error', () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x'), next(7, 'x'), error(11, '#')];
      const scheduler = new TestScheduler(false, 1, 1000);

      const e1 = scheduler.createColdObservable('---1---2---#');
      const messages = scheduler.getMessages(e1.pipe(mapTo('x')));

      expect(messages).to.be.empty;
      scheduler.flush();

      expect(messages).to.deep.equal(expected);
      expect(e1.subscriptions).to.deep.equal([subscribe(0, 11)]);
    });

    it('should materialize inner observable with cold observable source', () => {
      const scheduler = new TestScheduler(false, 1, 1000);
      const expected: Array<TestMessage<Readonly<TestMessage<string | TestMessage<string>[]>[]>>> = [
        next(0, parseObservableMarble<string>(' ---a---b---(c|)')),
        next(11, parseObservableMarble<string>('           ----d---|')),
        complete(19),
      ];

      const source = scheduler.createColdObservable('---a---b---c---d---|');

      const messages = scheduler.getMessages(source.pipe(windowCount(3)));
      expect(messages).to.be.empty;

      scheduler.flush();
      expect(messages).to.deep.equal(expected);
    });

    it('should materialize inner observable with cold observable source with error', () => {
      const scheduler = new TestScheduler(false, 1, 1000);
      const expected: Array<TestMessage<Readonly<TestMessage<string | TestMessage<string>[]>[]>>> = [
        next(0, parseObservableMarble<string>(' ---a---b---(c|)')),
        next(11, parseObservableMarble<string>('           ----#')),
        error(15, '#'),
      ];

      const source = scheduler.createColdObservable('---a---b---c---#');

      const messages = scheduler.getMessages(source.pipe(windowCount(3)));
      expect(messages).to.be.empty;

      scheduler.flush();
      expect(messages).to.deep.equal(expected);
    });

    it('should materialize inner observable with hot observable source', () => {
      const scheduler = new TestScheduler(false, 1, 1000);
      const expected: Array<TestMessage<Readonly<TestMessage<string | TestMessage<string>[]>[]>>> = [
        next(0, parseObservableMarble<string>(' ---a---b---(c|)')),
        next(11, parseObservableMarble<string>('           ----d---|')),
        complete(19),
      ];

      const source = scheduler.createHotObservable('---a---b---c---d---|');

      const messages = scheduler.getMessages(source.pipe(windowCount(3)));
      expect(messages).to.be.empty;

      scheduler.flush();
      expect(messages).to.deep.equal(expected);
    });

    it('should materialize inner observable with hot observable source with error', () => {
      const scheduler = new TestScheduler(false, 1, 1000);
      const expected: Array<TestMessage<Readonly<TestMessage<string | TestMessage<string>[]>[]>>> = [
        next(0, parseObservableMarble<string>(' ---a---b---(c|)')),
        next(11, parseObservableMarble<string>('           ----#')),
        error(15, '#'),
      ];

      const source = scheduler.createHotObservable('---a---b---c---#');

      const messages = scheduler.getMessages(source.pipe(windowCount(3)));
      expect(messages).to.be.empty;

      scheduler.flush();
      expect(messages).to.deep.equal(expected);
    });

    it('should support subscription with cold observable source', () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x')];
      const scheduler = new TestScheduler(false, 1, 1000);

      const e1 = scheduler.createColdObservable('---1---2---|');
      const sub = '                              ------^---!';
      //actual subscription:                           ---1-

      const messages = scheduler.getMessages(e1.pipe(mapTo('x')), sub);

      expect(messages).to.be.empty;
      scheduler.flush();

      expect(messages).to.deep.equal(expected);
      expect(e1.subscriptions).to.deep.equal([subscribe(0, 4)]);
    });

    it('should support subscription with hot observable source', () => {
      const expected: Array<TestMessage<string>> = [next(7, 'x')];
      const scheduler = new TestScheduler(false, 1, 1000);

      const e1 = scheduler.createHotObservable('---1---2---|');
      const sub = '                             ------^---!';
      const messages = scheduler.getMessages(e1.pipe(mapTo('x')), sub);

      expect(messages).to.be.empty;
      scheduler.flush();

      expect(messages).to.deep.equal(expected);
      expect(e1.subscriptions).to.deep.equal([subscribe(6, 10)]);
    });
  });

  describe('flush', () => {
    it(`should not flush while it's already flushing`, () => {
      const scheduler = new TestScheduler(false, 1, 1000);

      const expected = [next(20, 'a'), next(40, 'b'), next(60, 'c'), complete(80)];

      scheduler.schedule((x: TestScheduler | undefined) => x?.flush(), 50, scheduler);

      const source = scheduler.createHotObservable([next(20, 'a'), next(40, 'b'), next(60, 'c'), complete<string>(80)]);
      const messages = scheduler.getMessages(source);

      scheduler.flush();

      expect(messages).to.deep.equal(expected);
    });
  });

  describe('advanceTo', () => {
    it('should throw when autoflush set', () => {
      const scheduler = new TestScheduler(true, 1, 1000);

      expect(() => scheduler.advanceTo(10)).to.throw();
    });

    it('should able to advance to absolute time', () => {
      const scheduler = new TestScheduler(false, 1, 1000);
      const toFrame = 50;

      const expected = [next(20, 'a'), next(40, 'b')];

      const source = scheduler.createHotObservable([next(20, 'a'), next(40, 'b'), next(60, 'c'), complete<string>(80)]);

      const messages = scheduler.getMessages(source);

      scheduler.advanceTo(toFrame);

      expect(messages).to.deep.equal(expected);
      expect(scheduler.frame).to.equal(toFrame);
      expect(scheduler.now()).to.equal(toFrame);
    });

    it('should not do anything with zero absolute time', () => {
      const scheduler = new TestScheduler(false, 1, 1000);

      const source = scheduler.createHotObservable([next(20, 'a'), next(40, 'b'), next(60, 'c'), complete<string>(80)]);

      const messages = scheduler.getMessages(source);

      scheduler.advanceTo(0);

      expect(messages).to.empty;
    });

    it('should able to advance without any actions setup', () => {
      const scheduler = new TestScheduler(false, 1, 1000);
      expect(() => scheduler.advanceTo(100)).to.not.throw();
    });

    it('should not allow backward', () => {
      const scheduler = new TestScheduler(false, 1, 1000);
      scheduler.advanceTo(100);

      expect(() => scheduler.advanceTo(80)).to.throw();
      expect(() => scheduler.advanceTo(-1)).to.throw();
    });

    it('should unsubscribe the rest of the scheduled actions if an action throws an error', () => {
      const scheduler = new TestScheduler(false, 1, 1000);

      const error = new Error('meh');
      let normalActionExecuted = false;

      const errorAction = new AsyncAction(scheduler, () => {
        throw error;
      });
      const normalAction = new AsyncAction(scheduler, () => {
        normalActionExecuted = true;
      });

      errorAction.schedule({}, 20);
      normalAction.schedule({}, 40);

      scheduler.actions.push(errorAction, normalAction);

      expect(() => scheduler.advanceTo(100)).to.throw(error);

      expect(errorAction.closed).to.be.true;
      expect(normalAction.closed).to.be.true;
      expect(normalActionExecuted).to.be.false;
    });
  });
});
