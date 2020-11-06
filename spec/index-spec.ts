import { mapTo } from 'rxjs/operators';
import * as idx from '../src/index';

describe('rxSandbox', () => {
  it('should export', () => {
    expect(idx).toHaveProperty('rxSandbox');
  });

  it('should able to create instance', () => {
    const sandbox = idx.rxSandbox;

    const first = sandbox.create();
    const second = sandbox.create();

    expect(first).not.toEqual(second);
  });

  it('should able to create async tick flush instance', async () => {
    expect.assertions(1);

    const sandbox = idx.rxSandbox;

    const instance = sandbox.create({flushWithAsyncTick: true});

    // verify instance returns promise based interfaces
    await instance.flush().then(() => expect(true).toBeTruthy());
  });

  it('should able to create instance with autoflush', () => {
    const sandbox = idx.rxSandbox;

    const { hot, getMessages } = sandbox.create(true);
    const source = hot('--a--|');
    const expected = [idx.next(2, 'a'), idx.complete(5)];

    const v = getMessages(source.pipe(mapTo('a')));
    expect(v).toEqual(expected);
  });

  it('should allow specify frameTimeFactor', () => {
    const sandbox = idx.rxSandbox;

    const { hot, getMessages } = sandbox.create(true, 2, 8);
    const source = hot('-a--b');
    const expected = [idx.next(2, 'a')];

    const v = getMessages(source.pipe(mapTo('a')));
    expect(v).toEqual(expected);
  });

  it('should allow specify maxFrameValue', () => {
    const sandbox = idx.rxSandbox;

    const { hot, getMessages } = sandbox.create(true, 1, 4);
    const source = hot('--a--|');
    const expected = [idx.next(2, 'a')];

    const v = getMessages(source.pipe(mapTo('a')));
    expect(v).toEqual(expected);
  });

  it('should able to create instance with custom frame', () => {
    const sandbox = idx.rxSandbox;

    const { e } = sandbox.create(false, 10);
    const v = e('--a--|');
    const expected = [idx.next(20, 'a'), idx.complete(50)];

    expect(v).toEqual(expected);
  });

  it('should able to create instance with custom maxFrame', () => {
    const sandbox = idx.rxSandbox;

    const { e } = sandbox.create(false, 1, 5);
    const v = e('--a------|');
    const expected = [idx.next(2, 'a')];

    expect(v).toEqual(expected);
  });

  it('should able to create expected message values', () => {
    const { e } = idx.rxSandbox.create();

    const v = e('---a--|');
    const expected = [idx.next(3, 'a'), idx.complete(6)];

    expect(v).toEqual(expected);
  });

  it('should able to create expected subscription values', () => {
    const { s } = idx.rxSandbox.create();

    const v = s('--^--!');

    expect(v).toEqual(idx.subscribe(2, 5));
  });

  it('should export assert utility', () => {
    const { marbleAssert } = idx.rxSandbox;

    expect(marbleAssert).toBeInstanceOf(Function);
  });
});
