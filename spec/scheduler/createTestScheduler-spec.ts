import { mapTo, mergeMap, windowCount } from 'rxjs/operators';
import { parseObservableMarble } from '../../src/marbles/parseObservableMarble';
import { complete, error, next, subscribe, TestMessage } from '../../src/message/TestMessage';
import { createTestScheduler } from '../../src/scheduler/createTestScheduler';
import { AsyncAction, ColdObservable, HotObservable } from '../../src/utils/coreInternalImport';

describe('createTestScheduler', () => {
  describe('hotObservable', () => {
    it('should create hot observable via TestMessage', () => {
      const { hot } = createTestScheduler(false, 1, 1000, false);
      const messages: Array<TestMessage<string>> = [next(10, 'meh'), complete(20)];

      const value = hot(messages);

      expect(value).toBeInstanceOf(HotObservable);
      expect(value.messages).toEqual(messages);
    });

    it('should create hot observable via marble diagram', () => {
      const { hot } = createTestScheduler(false, 1, 1000, false);
      const value = hot('---a---|');

      const expected: Array<TestMessage<string>> = [next(3, 'a'), complete(7)];

      expect(value).toBeInstanceOf(HotObservable);
      expect(value.messages).toEqual(expected);
    });

    it('should create hot observale via marble with custom value', () => {
      const { hot } = createTestScheduler(false, 1, 1000, false);
      const value = hot('---a---|', {
        a: 'meh',
      });

      const expected: Array<TestMessage<string>> = [next(3, 'meh'), complete(7)];

      expect(value).toBeInstanceOf(HotObservable);
      expect(value.messages).toEqual(expected);
    });

    it('should create hot observable via marble with error', () => {
      const { hot } = createTestScheduler(false, 1, 1000, false);
      const value = hot('---a---#');

      const expected: Array<TestMessage<string>> = [next(3, 'a'), error(7, '#')];

      expect(value).toBeInstanceOf(HotObservable);
      expect(value.messages).toEqual(expected);
    });

    it('should create hot observable via marble with custom error', () => {
      const { hot } = createTestScheduler(false, 1, 1000, false);
      const value = hot('---a---#', null, 'meh');

      const expected: Array<TestMessage<string>> = [next(3, 'a'), error(7, 'meh')];

      expect(value).toBeInstanceOf(HotObservable);
      expect(value.messages).toEqual(expected);
    });

    it('should honor custom frameTimeFactor', () => {
      const { hot } = createTestScheduler(false, 10, 1000, false);

      const value = hot('---a---|');

      const expected: Array<TestMessage<string>> = [next(30, 'a'), complete(70)];

      expect(value).toBeInstanceOf(HotObservable);
      expect(value.messages).toEqual(expected);
    });
  });

  describe('coldObservable', () => {
    it('should create cold observable via TestMessage', () => {
      const { cold } = createTestScheduler(false, 1, 1000, false);
      const messages: Array<TestMessage<string>> = [next(10, 'meh'), complete(20)];

      const value = cold(messages);

      expect(value).toBeInstanceOf(ColdObservable);
      expect(value.messages).toEqual(messages);
    });

    it('should create cold observable via marble diagram', () => {
      const { cold } = createTestScheduler(false, 1, 1000, false);
      const value = cold('---a---|');

      const expected: Array<TestMessage<string>> = [next(3, 'a'), complete(7)];

      expect(value).toBeInstanceOf(ColdObservable);
      expect(value.messages).toEqual(expected);
    });

    it('should create cold observale via marble with custom value', () => {
      const { cold } = createTestScheduler(false, 1, 1000, false);
      const value = cold('---a---|', {
        a: 'meh',
      });

      const expected: Array<TestMessage<string>> = [next(3, 'meh'), complete(7)];

      expect(value).toBeInstanceOf(ColdObservable);
      expect(value.messages).toEqual(expected);
    });

    it('should create cold observable via marble with error', () => {
      const { cold } = createTestScheduler(false, 1, 1000, false);
      const value = cold('---a---#');

      const expected: Array<TestMessage<string>> = [next(3, 'a'), error(7, '#')];

      expect(value).toBeInstanceOf(ColdObservable);
      expect(value.messages).toEqual(expected);
    });

    it('should create cold observable via marble with custom error', () => {
      const { cold } = createTestScheduler(false, 1, 1000, false);
      const value = cold('---a---#', null, 'meh');

      const expected: Array<TestMessage<string>> = [next(3, 'a'), error(7, 'meh')];

      expect(value).toBeInstanceOf(ColdObservable);
      expect(value.messages).toEqual(expected);
    });

    it('should honor custom frameTimeFactor', () => {
      const { cold } = createTestScheduler(false, 10, 1000, false);

      const value = cold('---a---|');

      const expected: Array<TestMessage<string>> = [next(30, 'a'), complete(70)];

      expect(value).toBeInstanceOf(ColdObservable);
      expect(value.messages).toEqual(expected);
    });

    it('should throw when marble includes unsupported token', () => {
      const { cold } = createTestScheduler(false, 1, 1000, false);

      expect(() => cold('----^')).toThrow();
    });
  });

  describe('getMessages', () => {
    it('should generate messages from observable having hot observable source', () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x'), next(7, 'x'), complete(11)];
      const { flush, getMessages, hot } = createTestScheduler(false, 1, 1000, false);

      const e1 = hot('---1---2---|');
      const messages = getMessages(e1.pipe(mapTo('x')));

      expect(messages).toHaveLength(0);
      flush();

      expect(messages).toEqual(expected);
      expect(e1.subscriptions).toEqual([subscribe(0, 11)]);
    });

    it('should able to autoflush with hot observable source', () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x'), next(7, 'x'), complete(11)];
      const { hot, getMessages } = createTestScheduler(true, 1, 1000, false);

      const e1 = hot('---1---2---|');
      const messages = getMessages(e1.pipe(mapTo('x')));

      expect(messages).toEqual(expected);
      expect(e1.subscriptions).toEqual([subscribe(0, 11)]);
    });

    it('should throw when autoflush attempted multiple times', () => {
      const { hot, getMessages } = createTestScheduler(true, 1, 1000, false);

      const e1 = hot('---1---2---|');
      getMessages(e1.pipe(mapTo('x')));

      expect(() => getMessages(e1.pipe(mapTo('x')))).toThrow();
    });

    it('should ignore values over max frames', () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x')];
      const { hot, getMessages } = createTestScheduler(true, 1, 5, false);

      const e1 = hot('---1---2---|');
      const messages = getMessages(e1.pipe(mapTo('x')));

      expect(messages).toEqual(expected);
    });

    it('should generate messages from observable having hot observable source with error', () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x'), next(7, 'x'), error(11, '#')];
      const { flush, getMessages, hot } = createTestScheduler(false, 1, 1000, false);

      const e1 = hot('---1---2---#');
      const messages = getMessages(e1.pipe(mapTo('x')));

      expect(messages).toHaveLength(0);
      flush();

      expect(messages).toEqual(expected);
      expect(e1.subscriptions).toEqual([subscribe(0, 11)]);
    });

    it('should generate messages from observable having cold observable source', () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x'), next(7, 'x'), complete(11)];
      const { flush, getMessages, cold } = createTestScheduler(false, 1, 1000, false);

      const e1 = cold('---1---2---|');
      const messages = getMessages(e1.pipe(mapTo('x')));

      expect(messages).toHaveLength(0);
      flush();

      expect(messages).toEqual(expected);
      expect(e1.subscriptions).toEqual([subscribe(0, 11)]);
    });

    it('should able to autoflush with cold observable source', () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x'), next(7, 'x'), complete(11)];
      const { cold, getMessages } = createTestScheduler(true, 1, 1000, false);

      const e1 = cold('---1---2---|');
      const messages = getMessages(e1.pipe(mapTo('x')));

      expect(messages).toEqual(expected);
      expect(e1.subscriptions).toEqual([subscribe(0, 11)]);
    });

    it('should generate messages from observable having cold observable source with error', () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x'), next(7, 'x'), error(11, '#')];
      const { flush, getMessages, cold } = createTestScheduler(false, 1, 1000, false);

      const e1 = cold('---1---2---#');
      const messages = getMessages(e1.pipe(mapTo('x')));

      expect(messages).toHaveLength(0);
      flush();

      expect(messages).toEqual(expected);
      expect(e1.subscriptions).toEqual([subscribe(0, 11)]);
    });

    it('should materialize inner observable with cold observable source', () => {
      const { flush, getMessages, cold } = createTestScheduler(false, 1, 1000, false);
      const expected: Array<TestMessage<Readonly<TestMessage<string | TestMessage<string>[]>[]>>> = [
        next(0, parseObservableMarble<string>(' ---a---b---(c|)')),
        next(11, parseObservableMarble<string>('           ----d---|')),
        complete(19),
      ];

      const source = cold('---a---b---c---d---|');

      const messages = getMessages(source.pipe(windowCount(3)));
      expect(messages).toHaveLength(0);

      flush();
      expect(messages).toEqual(expected);
    });

    it('should materialize inner observable with cold observable source with error', () => {
      const { flush, getMessages, cold } = createTestScheduler(false, 1, 1000, false);
      const expected: Array<TestMessage<Readonly<TestMessage<string | TestMessage<string>[]>[]>>> = [
        next(0, parseObservableMarble<string>(' ---a---b---(c|)')),
        next(11, parseObservableMarble<string>('           ----#')),
        error(15, '#'),
      ];

      const source = cold('---a---b---c---#');

      const messages = getMessages(source.pipe(windowCount(3)));
      expect(messages).toHaveLength(0);

      flush();
      expect(messages).toEqual(expected);
    });

    it('should materialize inner observable with hot observable source', () => {
      const { flush, getMessages, hot } = createTestScheduler(false, 1, 1000, false);
      const expected: Array<TestMessage<Readonly<TestMessage<string | TestMessage<string>[]>[]>>> = [
        next(0, parseObservableMarble<string>(' ---a---b---(c|)')),
        next(11, parseObservableMarble<string>('           ----d---|')),
        complete(19),
      ];

      const source = hot('---a---b---c---d---|');

      const messages = getMessages(source.pipe(windowCount(3)));
      expect(messages).toHaveLength(0);

      flush();
      expect(messages).toEqual(expected);
    });

    it('should materialize inner observable with hot observable source with error', () => {
      const { flush, getMessages, hot } = createTestScheduler(false, 1, 1000, false);
      const expected: Array<TestMessage<Readonly<TestMessage<string | TestMessage<string>[]>[]>>> = [
        next(0, parseObservableMarble<string>(' ---a---b---(c|)')),
        next(11, parseObservableMarble<string>('           ----#')),
        error(15, '#'),
      ];

      const source = hot('---a---b---c---#');

      const messages = getMessages(source.pipe(windowCount(3)));
      expect(messages).toHaveLength(0);

      flush();
      expect(messages).toEqual(expected);
    });

    it('should support subscription with cold observable source', () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x')];
      const { flush, getMessages, cold } = createTestScheduler(false, 1, 1000, false);

      const e1 = cold('---1---2---|');
      const sub = '                              ------^---!';
      //actual subscription:                           ---1-

      const messages = getMessages(e1.pipe(mapTo('x')), sub);

      expect(messages).toHaveLength(0);
      flush();

      expect(messages).toEqual(expected);
      expect(e1.subscriptions).toEqual([subscribe(0, 4)]);
    });

    it('should support subscription with hot observable source', () => {
      const expected: Array<TestMessage<string>> = [next(7, 'x')];
      const { flush, getMessages, hot } = createTestScheduler(false, 1, 1000, false);

      const e1 = hot('---1---2---|');
      const sub = '                             ------^---!';
      const messages = getMessages(e1.pipe(mapTo('x')), sub);

      expect(messages).toHaveLength(0);
      flush();

      expect(messages).toEqual(expected);
      expect(e1.subscriptions).toEqual([subscribe(6, 10)]);
    });
  });

  describe('flush', () => {
    it(`should not flush while it's already flushing`, () => {
      const { scheduler, getMessages, hot, flush } = createTestScheduler(false, 1, 1000, false);

      const expected = [next(20, 'a'), next(40, 'b'), next(60, 'c'), complete(80)];

      scheduler.schedule((_x: typeof scheduler | undefined) => flush(), 50, scheduler);

      const source = hot([next(20, 'a'), next(40, 'b'), next(60, 'c'), complete<string>(80)]);
      const messages = getMessages(source);

      flush();

      expect(messages).toEqual(expected);
    });
  });

  describe('advanceTo', () => {
    it('should throw when autoflush set', () => {
      const { advanceTo } = createTestScheduler(true, 1, 1000, false);

      expect(() => advanceTo(10)).toThrow();
    });

    it('should able to advance to absolute time', () => {
      const { scheduler, advanceTo, getMessages, hot } = createTestScheduler(false, 1, 1000, false);
      const toFrame = 50;

      const expected = [next(20, 'a'), next(40, 'b')];

      const source = hot([next(20, 'a'), next(40, 'b'), next(60, 'c'), complete<string>(80)]);

      const messages = getMessages(source);

      advanceTo(toFrame);

      expect(messages).toEqual(expected);
      expect((scheduler as any).frame).toEqual(toFrame);
      expect(scheduler.now()).toEqual(toFrame);
    });

    it('should not do anything with zero absolute time', () => {
      const { hot, advanceTo, getMessages } = createTestScheduler(false, 1, 1000, false);

      const source = hot([next(20, 'a'), next(40, 'b'), next(60, 'c'), complete<string>(80)]);

      const messages = getMessages(source);

      advanceTo(0);

      expect(messages).toHaveLength(0);
    });

    it('should able to advance without any actions setup', () => {
      const { advanceTo } = createTestScheduler(false, 1, 1000, false);
      expect(() => advanceTo(100)).not.toThrow();
    });

    it('should not allow backward', () => {
      const { advanceTo } = createTestScheduler(false, 1, 1000, false);
      advanceTo(100);

      expect(() => advanceTo(80)).toThrow();
      expect(() => advanceTo(-1)).toThrow();
    });

    it('should unsubscribe the rest of the scheduled actions if an action throws an error', () => {
      const { scheduler, advanceTo } = createTestScheduler(false, 1, 1000, false);

      const error = new Error('meh');
      let normalActionExecuted = false;

      const errorAction = new AsyncAction(scheduler as any, () => {
        throw error;
      });
      const normalAction = new AsyncAction(scheduler as any, () => {
        normalActionExecuted = true;
      });

      errorAction.schedule({}, 20);
      normalAction.schedule({}, 40);

      (scheduler as any).actions.push(errorAction, normalAction);

      expect(() => advanceTo(100)).toThrowError(error);

      expect(errorAction.closed).toBeTruthy();
      expect(normalAction.closed).toBeTruthy();
      expect(normalActionExecuted).toBeFalsy();
    });
  });

  it('does not support innerobservable from promise', () => {
    const { hot, getMessages, flush } = createTestScheduler(false, 1, 1000, false);

    const sourceMessage = [next(20, 'a'), next(40, 'b'), next(60, 'c'), complete<string>(80)];

    const source = hot(sourceMessage).pipe(mergeMap((v) => new Promise((res) => res(v))));
    const messages = getMessages(source);

    flush();

    //scheduler flushes synchronously, so inner promise does not resolve while flush actions
    expect(messages).toEqual([]);
  });
});