import { mapTo, mergeMap, windowCount } from 'rxjs/operators';
import { parseObservableMarble } from '../../src/marbles/parseObservableMarble';
import { complete, error, next, subscribe, TestMessage } from '../../src/message/TestMessage';
import { createTestScheduler } from '../../src/scheduler/createTestScheduler';
import { AsyncAction, ColdObservable, HotObservable } from '../../src/utils/coreInternalImport';

describe('createTestSchedulerWithAsyncTickFlush', () => {
  describe('hotObservable', () => {
    it('should create hot observable via TestMessage', () => {
      const { hot } = createTestScheduler(false, 1, 1000, true);
      const messages: Array<TestMessage<string>> = [next(10, 'meh'), complete(20)];

      const value = hot(messages);

      expect(value).toBeInstanceOf(HotObservable);
      expect(value.messages).toEqual(messages);
    });

    it('should create hot observable via marble diagram', () => {
      const { hot } = createTestScheduler(false, 1, 1000, true);
      const value = hot('---a---|');

      const expected: Array<TestMessage<string>> = [next(3, 'a'), complete(7)];

      expect(value).toBeInstanceOf(HotObservable);
      expect(value.messages).toEqual(expected);
    });

    it('should create hot observale via marble with custom value', () => {
      const { hot } = createTestScheduler(false, 1, 1000, true);
      const value = hot('---a---|', {
        a: 'meh',
      });

      const expected: Array<TestMessage<string>> = [next(3, 'meh'), complete(7)];

      expect(value).toBeInstanceOf(HotObservable);
      expect(value.messages).toEqual(expected);
    });

    it('should create hot observable via marble with error', () => {
      const { hot } = createTestScheduler(false, 1, 1000, true);
      const value = hot('---a---#');

      const expected: Array<TestMessage<string>> = [next(3, 'a'), error(7, '#')];

      expect(value).toBeInstanceOf(HotObservable);
      expect(value.messages).toEqual(expected);
    });

    it('should create hot observable via marble with custom error', () => {
      const { hot } = createTestScheduler(false, 1, 1000, true);
      const value = hot('---a---#', null, 'meh');

      const expected: Array<TestMessage<string>> = [next(3, 'a'), error(7, 'meh')];

      expect(value).toBeInstanceOf(HotObservable);
      expect(value.messages).toEqual(expected);
    });

    it('should honor custom frameTimeFactor', () => {
      const { hot } = createTestScheduler(false, 10, 1000, true);

      const value = hot('---a---|');

      const expected: Array<TestMessage<string>> = [next(30, 'a'), complete(70)];

      expect(value).toBeInstanceOf(HotObservable);
      expect(value.messages).toEqual(expected);
    });
  });

  describe('coldObservable', () => {
    it('should create cold observable via TestMessage', () => {
      const { cold } = createTestScheduler(false, 1, 1000, true);
      const messages: Array<TestMessage<string>> = [next(10, 'meh'), complete(20)];

      const value = cold(messages);

      expect(value).toBeInstanceOf(ColdObservable);
      expect(value.messages).toEqual(messages);
    });

    it('should create cold observable via marble diagram', () => {
      const { cold } = createTestScheduler(false, 1, 1000, true);
      const value = cold('---a---|');

      const expected: Array<TestMessage<string>> = [next(3, 'a'), complete(7)];

      expect(value).toBeInstanceOf(ColdObservable);
      expect(value.messages).toEqual(expected);
    });

    it('should create cold observale via marble with custom value', () => {
      const { cold } = createTestScheduler(false, 1, 1000, true);
      const value = cold('---a---|', {
        a: 'meh',
      });

      const expected: Array<TestMessage<string>> = [next(3, 'meh'), complete(7)];

      expect(value).toBeInstanceOf(ColdObservable);
      expect(value.messages).toEqual(expected);
    });

    it('should create cold observable via marble with error', () => {
      const { cold } = createTestScheduler(false, 1, 1000, true);
      const value = cold('---a---#');

      const expected: Array<TestMessage<string>> = [next(3, 'a'), error(7, '#')];

      expect(value).toBeInstanceOf(ColdObservable);
      expect(value.messages).toEqual(expected);
    });

    it('should create cold observable via marble with custom error', () => {
      const { cold } = createTestScheduler(false, 1, 1000, true);
      const value = cold('---a---#', null, 'meh');

      const expected: Array<TestMessage<string>> = [next(3, 'a'), error(7, 'meh')];

      expect(value).toBeInstanceOf(ColdObservable);
      expect(value.messages).toEqual(expected);
    });

    it('should honor custom frameTimeFactor', () => {
      const { cold } = createTestScheduler(false, 10, 1000, true);

      const value = cold('---a---|');

      const expected: Array<TestMessage<string>> = [next(30, 'a'), complete(70)];

      expect(value).toBeInstanceOf(ColdObservable);
      expect(value.messages).toEqual(expected);
    });

    it('should throw when marble includes unsupported token', () => {
      const { cold } = createTestScheduler(false, 1, 1000, true);

      expect(() => cold('----^')).toThrow();
    });
  });

  describe('getMessages', () => {
    it('should generate messages from observable having hot observable source', async () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x'), next(7, 'x'), complete(11)];
      const { flush, getMessages, hot } = createTestScheduler(false, 1, 1000, true);

      const e1 = hot('---1---2---|');
      const messages = await getMessages(e1.pipe(mapTo('x')));

      expect(messages).toHaveLength(0);
      await flush();

      expect(messages).toEqual(expected);
      expect(e1.subscriptions).toEqual([subscribe(0, 11)]);
    });

    it('should able to autoflush with hot observable source', async () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x'), next(7, 'x'), complete(11)];
      const { hot, getMessages } = createTestScheduler(true, 1, 1000, true);

      const e1 = hot('---1---2---|');
      const messages = await getMessages(e1.pipe(mapTo('x')));

      expect(messages).toEqual(expected);
      expect(e1.subscriptions).toEqual([subscribe(0, 11)]);
    });

    it('should throw when autoflush attempted multiple times', async () => {
      const { hot, getMessages } = createTestScheduler(true, 1, 1000, true);

      const e1 = hot('---1---2---|');
      await getMessages(e1.pipe(mapTo('x')));

      expect(() => getMessages(e1.pipe(mapTo('x')))).toThrow();
    });

    it('should ignore values over max frames', async () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x')];
      const { hot, getMessages } = createTestScheduler(true, 1, 5, true);

      const e1 = hot('---1---2---|');
      const messages = await getMessages(e1.pipe(mapTo('x')));

      expect(messages).toEqual(expected);
    });

    it('should generate messages from observable having hot observable source with error', async () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x'), next(7, 'x'), error(11, '#')];
      const { flush, getMessages, hot } = createTestScheduler(false, 1, 1000, true);

      const e1 = hot('---1---2---#');
      const messages = await getMessages(e1.pipe(mapTo('x')));

      expect(messages).toHaveLength(0);
      await flush();

      expect(messages).toEqual(expected);
      expect(e1.subscriptions).toEqual([subscribe(0, 11)]);
    });

    it('should generate messages from observable having cold observable source', async () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x'), next(7, 'x'), complete(11)];
      const { flush, getMessages, cold } = createTestScheduler(false, 1, 1000, true);

      const e1 = cold('---1---2---|');
      const messages = await getMessages(e1.pipe(mapTo('x')));

      expect(messages).toHaveLength(0);
      await flush();

      expect(messages).toEqual(expected);
      expect(e1.subscriptions).toEqual([subscribe(0, 11)]);
    });

    it('should able to autoflush with cold observable source', async () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x'), next(7, 'x'), complete(11)];
      const { cold, getMessages } = createTestScheduler(true, 1, 1000, true);

      const e1 = cold('---1---2---|');
      const messages = await getMessages(e1.pipe(mapTo('x')));

      expect(messages).toEqual(expected);
      expect(e1.subscriptions).toEqual([subscribe(0, 11)]);
    });

    it('should generate messages from observable having cold observable source with error', async () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x'), next(7, 'x'), error(11, '#')];
      const { flush, getMessages, cold } = createTestScheduler(false, 1, 1000, true);

      const e1 = cold('---1---2---#');
      const messages = await getMessages(e1.pipe(mapTo('x')));

      expect(messages).toHaveLength(0);
      await flush();

      expect(messages).toEqual(expected);
      expect(e1.subscriptions).toEqual([subscribe(0, 11)]);
    });

    it('should materialize inner observable with cold observable source', async () => {
      const { flush, getMessages, cold } = createTestScheduler(false, 1, 1000, true);
      const expected: Array<TestMessage<Readonly<TestMessage<string | TestMessage<string>[]>[]>>> = [
        next(0, parseObservableMarble<string>(' ---a---b---(c|)')),
        next(11, parseObservableMarble<string>('           ----d---|')),
        complete(19),
      ];

      const source = cold('---a---b---c---d---|');

      const messages = await getMessages(source.pipe(windowCount(3)));
      expect(messages).toHaveLength(0);

      await flush();
      expect(messages).toEqual(expected);
    });

    it('should materialize inner observable with cold observable source with error', async () => {
      const { flush, getMessages, cold } = createTestScheduler(false, 1, 1000, true);
      const expected: Array<TestMessage<Readonly<TestMessage<string | TestMessage<string>[]>[]>>> = [
        next(0, parseObservableMarble<string>(' ---a---b---(c|)')),
        next(11, parseObservableMarble<string>('           ----#')),
        error(15, '#'),
      ];

      const source = cold('---a---b---c---#');

      const messages = await getMessages(source.pipe(windowCount(3)));
      expect(messages).toHaveLength(0);

      await flush();
      expect(messages).toEqual(expected);
    });

    it('should materialize inner observable with hot observable source', async () => {
      const { flush, getMessages, hot } = createTestScheduler(false, 1, 1000, true);
      const expected: Array<TestMessage<Readonly<TestMessage<string | TestMessage<string>[]>[]>>> = [
        next(0, parseObservableMarble<string>(' ---a---b---(c|)')),
        next(11, parseObservableMarble<string>('           ----d---|')),
        complete(19),
      ];

      const source = hot('---a---b---c---d---|');

      const messages = await getMessages(source.pipe(windowCount(3)));
      expect(messages).toHaveLength(0);

      await flush();
      expect(messages).toEqual(expected);
    });

    it('should materialize inner observable with hot observable source with error', async () => {
      const { flush, getMessages, hot } = createTestScheduler(false, 1, 1000, true);
      const expected: Array<TestMessage<Readonly<TestMessage<string | TestMessage<string>[]>[]>>> = [
        next(0, parseObservableMarble<string>(' ---a---b---(c|)')),
        next(11, parseObservableMarble<string>('           ----#')),
        error(15, '#'),
      ];

      const source = hot('---a---b---c---#');

      const messages = await getMessages(source.pipe(windowCount(3)));
      expect(messages).toHaveLength(0);

      await flush();
      expect(messages).toEqual(expected);
    });

    it('should support subscription with cold observable source', async () => {
      const expected: Array<TestMessage<string>> = [next(3, 'x')];
      const { flush, getMessages, cold } = createTestScheduler(false, 1, 1000, true);

      const e1 = cold('---1---2---|');
      const sub = '                              ------^---!';
      //actual subscription:                           ---1-

      const messages = await getMessages(e1.pipe(mapTo('x')), sub);

      expect(messages).toHaveLength(0);
      await flush();

      expect(messages).toEqual(expected);
      expect(e1.subscriptions).toEqual([subscribe(0, 4)]);
    });

    it('should support subscription with hot observable source', async () => {
      const expected: Array<TestMessage<string>> = [next(7, 'x')];
      const { flush, getMessages, hot } = createTestScheduler(false, 1, 1000, true);

      const e1 = hot('---1---2---|');
      const sub = '                             ------^---!';
      const messages = await getMessages(e1.pipe(mapTo('x')), sub);

      expect(messages).toHaveLength(0);
      await flush();

      expect(messages).toEqual(expected);
      expect(e1.subscriptions).toEqual([subscribe(6, 10)]);
    });
  });

  describe('flush', () => {
    it(`should not flush while it's already flushing`, async () => {
      const { scheduler, getMessages, hot, flush } = createTestScheduler(false, 1, 1000, true);

      const expected = [next(20, 'a'), next(40, 'b'), next(60, 'c'), complete(80)];

      scheduler.schedule(async (_x: typeof scheduler | undefined) => await flush(), 50, scheduler);

      const source = hot([next(20, 'a'), next(40, 'b'), next(60, 'c'), complete<string>(80)]);
      const messages = await getMessages(source);

      await flush();

      expect(messages).toEqual(expected);
    });
  });

  describe('advanceTo', () => {
    it('should throw when autoflush set', async () => {
      const { advanceTo } = createTestScheduler(true, 1, 1000, true);

      await expect(advanceTo(10)).rejects.toThrow();
    });

    it('should able to advance to absolute time', async () => {
      const { scheduler, advanceTo, getMessages, hot } = createTestScheduler(false, 1, 1000, true);
      const toFrame = 50;

      const expected = [next(20, 'a'), next(40, 'b')];

      const source = hot([next(20, 'a'), next(40, 'b'), next(60, 'c'), complete<string>(80)]);

      const messages = await getMessages(source);

      await advanceTo(toFrame);

      expect(messages).toEqual(expected);
      expect((scheduler as any).frame).toEqual(toFrame);
      expect(scheduler.now()).toEqual(toFrame);
    });

    it('should not do anything with zero absolute time', async () => {
      const { hot, advanceTo, getMessages } = createTestScheduler(false, 1, 1000, true);

      const source = hot([next(20, 'a'), next(40, 'b'), next(60, 'c'), complete<string>(80)]);

      const messages = await getMessages(source);

      await advanceTo(0);

      expect(messages).toHaveLength(0);
    });

    it('should able to advance without any actions setup', async () => {
      const { advanceTo } = createTestScheduler(false, 1, 1000, true);
      await expect(advanceTo(100)).resolves.not.toThrow();
    });

    it('should not allow backward', async () => {
      const { advanceTo } = createTestScheduler(false, 1, 1000, true);
      await advanceTo(100);

      await expect(advanceTo(80)).rejects.toThrow();
      await expect(advanceTo(-1)).rejects.toThrow();
    });

    it('should unsubscribe the rest of the scheduled actions if an action throws an error', async () => {
      const { scheduler, advanceTo } = createTestScheduler(false, 1, 1000, true);

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

      await expect(advanceTo(100)).rejects.toThrowError(error);

      expect(errorAction.closed).toBeTruthy();
      expect(normalAction.closed).toBeTruthy();
      expect(normalActionExecuted).toBeFalsy();
    });
  });

  it('should support innerobservable from promise ', async () => {
    const { hot, getMessages, flush } = createTestScheduler(false, 1, 1000, true);

    const sourceMessage = [next(20, 'a'), next(40, 'b'), next(60, 'c'), complete<string>(80)];

    const source = hot(sourceMessage).pipe(mergeMap((v) => new Promise((res) => res(v))));
    const messages = await getMessages(source);

    await flush();

    expect(messages).toEqual(sourceMessage);
  });
});