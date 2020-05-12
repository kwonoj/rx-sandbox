import { expect } from 'chai';
import { mapTo } from 'rxjs/operators';
import * as idx from '../src/index';

describe('rxSandbox', () => {
  it('should export', () => {
    expect(idx).to.have.property('rxSandbox');
  });

  it('should able to create instance', () => {
    const sandbox = idx.rxSandbox;

    const first = sandbox.create();
    const second = sandbox.create();

    expect(first).to.not.equal(second);
  });

  it('should able to create instance with autoflush', async () => {
    const sandbox = idx.rxSandbox;

    const { hot, getMessages } = sandbox.create(true);
    const source = hot('--a--|');
    const expected = [idx.next(2, 'a'), idx.complete(5)];

    const v = await getMessages(source.pipe(mapTo('a')));
    expect(v).to.deep.equal(expected);
  });

  it('should allow specify frameTimeFactor', async () => {
    const sandbox = idx.rxSandbox;

    const { hot, getMessages } = sandbox.create(true, 2, 8);
    const source = hot('-a--b');
    const expected = [idx.next(2, 'a')];

    const v = await getMessages(source.pipe(mapTo('a')));
    expect(v).to.deep.equal(expected);
  });

  it('should allow specify maxFrameValue', async () => {
    const sandbox = idx.rxSandbox;

    const { hot, getMessages } = sandbox.create(true, 1, 4);
    const source = hot('--a--|');
    const expected = [idx.next(2, 'a')];

    const v = await getMessages(source.pipe(mapTo('a')));
    expect(v).to.deep.equal(expected);
  });

  it('should able to create instance with custom frame', () => {
    const sandbox = idx.rxSandbox;

    const { e } = sandbox.create(false, 10);
    const v = e('--a--|');
    const expected = [idx.next(20, 'a'), idx.complete(50)];

    expect(v).to.deep.equal(expected);
  });

  it('should able to create instance with custom maxFrame', () => {
    const sandbox = idx.rxSandbox;

    const { e } = sandbox.create(false, 1, 5);
    const v = e('--a------|');
    const expected = [idx.next(2, 'a')];

    expect(v).to.deep.equal(expected);
  });

  it('should able to create expected message values', () => {
    const { e } = idx.rxSandbox.create();

    const v = e('---a--|');
    const expected = [idx.next(3, 'a'), idx.complete(6)];

    expect(v).to.deep.equal(expected);
  });

  it('should able to create expected subscription values', () => {
    const { s } = idx.rxSandbox.create();

    const v = s('--^--!');

    expect(v).to.deep.equal(idx.subscribe(2, 5));
  });

  it('should export assert utility', () => {
    const { marbleAssert } = idx.rxSandbox;

    expect(marbleAssert).to.be.a('function');
  });
});
