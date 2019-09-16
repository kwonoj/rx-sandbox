[![Build Status](https://circleci.com/gh/kwonoj/rx-sandbox/tree/master.svg?style=shield&circle-token=:circle-token)](https://circleci.com/gh/kwonoj/rx-sandbox/tree/master)
[![codecov](https://codecov.io/gh/kwonoj/rx-sandbox/branch/master/graph/badge.svg)](https://codecov.io/gh/kwonoj/rx-sandbox)
[![npm](https://img.shields.io/npm/v/rx-sandbox.svg)](https://www.npmjs.com/package/rx-sandbox)

# RxSandbox

`RxSandbox` is test suite for RxJS, based on marble diagram DSL for easier assertion around Observables.
For RxJS 5 support, check pre-1.x versions. 1.x supports latest RxJS 6.x.

## What's difference with `TestScheduler` in RxJS?

`RxJS` 5's test cases are written via its own [`TestScheduler`](https://github.com/ReactiveX/rxjs/blob/9267b30ebc982e1845843f85866906496b3aaa8f/src/testing/TestScheduler.ts) implementation. While it still can be used for testing any other Observable based codes its ergonomics are not user code friendly, reason why core repo tracks [issue](https://github.com/ReactiveX/rxjs/issues/1775) to provide separate package for general usage. RxSandbox aims to resolve those ergonomics with few design goals

- Provides feature parity to `TestScheduler`
- Support extended marble diagram DSL
- Near-zero configuration, works out of box
- No dependencies to specific test framework

# Install

This has a peer dependencies of `rxjs@6.*.*`, which will have to be installed as well

```sh
npm install rx-sandbox
```

# Usage

## Observable marble diagram token description

In `RxSandbox`, `Observable` is represented via `marble` diagram. Marble syntax is a string represents events happening over `virtual` time so called as `frame`.

- `-` : Single `frame` of time passage, by default `1`.
- `|` : Successful completion of an observable signaling `complete()`.
- `#` : An error terminating the observable signaling `error()`.
- ` `(whitespace) : Noop, whitespace does nothing but allows align marbles for readability.
- `a` : Any other character than predefined token represents a value being emitted by `next()`
- `()` : When multiple events need to single in the same frame synchronously, parenthesis are used to group those events. You can group nexted values, a completion or an error in this manner. The position of the initial `(`determines the time at which its values are emitted.
- `^` : (hot observables only) Shows the point at which the tested observables will be subscribed to the hot observable. This is the "zero frame" for that observable, every frame before the `^` will be negative.
- `!` : (for subscription testing) Shows the point  at which the tested observables will be unsubscribed.
- `...n...` : (`n` is number) Expanding timeframe. For cases of testing long time period in observable, can shorten marble diagram instead of repeating `-`.

The first character of marble string always represents `0` frame.

### Few examples

```js
const never = `------`; // Observable.never() regardless of number of `-`
const empty = `|`;      // Observable.empty();
const error = `#`;      // Observable.throw(`#`);
const obs1 = `----a----`;
//`           01234    `, emits `a` on frame 4
const obs2 = `----a---|`;
//`           012345678`, emits `a` on frame 4, completes on 8
const obs2 = `-a-^-b--|`;
//`              012345`, emits `b` on frame 2, completes on 5 - hot observable only
const obs3 = `--(abc)-|`;
//`           012222234, emits `a`,`b`,`c` on frame 2, completes on 4
const obs4 = `----(a|)`;
//`           01234444, emits `a` and complets on frame 4
const obs5 = ` - --a- -|`;
//`            0 1234 56, emits `a` on frame 3, completes on frame 6
const obs6 = `--...4...--|`
//`           01......5678, completes on 8

```



## Subscription marble diagram token description

The subscription marble syntax is slightly different to conventional marble syntax. It represents the **subscription** and an **unsubscription** points happening over time. There should be no other type of event represented in such diagram.

- `-` : Single `frame` of time passage, by default `1`.
- `^` : Shows the point in time at which a subscription happen.
- `!` : Shows the point in time at which a subscription is unsubscribed.
- (whitespace) : Noop, whitespace does nothing but allows align marbles for readability.
- `...n...` : (`n` is number) Expanding timeframe. For cases of testing long time period in observable, can shorten marble diagram instead of repeating `-`.

There should be **at most one** `^` point in a subscription marble diagram, and **at most one** `!` point. Other than that, the `-` character is the only one allowed in a subscription marble diagram.

### Few examples

```js
const sub1 = `-----`; // no subscription
const sub2 = `--^--`;
//`           012`, subscription happend on frame 2, not unsubscribed
const sub3 = `--^--!-`;
//`           012345, subscription happend on frame 2, unsubscribed on frame 5
```



## Anatomy of test interface

You can import `rxSandbox`, and create instance using `create()`.

```js
import { expect } from 'chai';
import { rxSandbox } from 'rx-sandbox';

it('testcase', () => {
  const { hot, cold, flush, getMessages, e, s } = rxSandbox.create();
  const e1 = hot('  --^--a--b--|');
  const e2 = cold('   ---x--y--|', {x: 1, y: 2});

  const expected = e('       ---q--r--|');
  const sub =      s('       ^        !');

  const messages = getMessages(e1.merge(e2));

  flush();

  //assertion
  expect(messages).to.deep.equal(expected);
  expect(e1.subscriptions).to.deep.equal(sub);
});
```

### Creating sandbox

```typescript
rxSandbox.create(autoFlush?: boolean, frameTimeFactor?: number, maxFrameValue?: number): RxSandboxInstance
```

`frameTimeFactor` allows to override default frame passage `1` to given value.
`maxFrameValue` allows to override maximum frame number testscheduler will accept. (`1000` by default). Maxframevalue is relavant to frameTimeFactor. (i.e if `frameTimeFactor = 2` and `maxFrameValue = 4`, `--` will represent max frame)

Refer below for `autoFlush` option.

### Using RxSandboxInstance

`RxSandboxInstance` exposes below interfaces.

#### Creating hot, cold observable

```typescript
hot<T = string>(marble: string, value?: { [key: string]: T } | null, error?: any): HotObservable<T>;
hot<T = string>(messages: Array<TestMessage<T>>): HotObservable<T>;

cold<T = string>(marble: string, value?: { [key: string]: T } | null, error?: any): ColdObservable<T>;
cold<T = string>(messages: Array<TestMessage<T>>): ColdObservable<T>;
```

Both interfaces accepts marble diagram string, and optionally accepts custom values for marble values or errors. Otherwise, you can create `Array<TestMessage<T>>` directly instead of marble diagram.

#### Creating expected value, subscriptions

To compare observable's result, we can use marble diagram as well wrapped by utility function to generate values to be asserted.

```typescript
e<T = string>(marble: string, value?: { [key: string]: T } | null, error?: any): Array<TestMessage<T>>;

//const expected = e(`----a---b--|`);
```

It accepts same parameter to hot / cold observable creation but instead of returning observable, returns array of metadata for marble diagram.

Subscription metadata also need to be generated via wrapped function.

```typescript
s(marble: string): SubscriptionLog;

//const subs = s('--^---!');
```

#### Getting values from observable

Once we have hot, cold observables we can get metadata from those observables as well to assert with expected metadata values.

```typescript
getMessages<T = string>(observable: Observable<any>, unsubscriptionMarbls: string = null): Array<TestMessage<T>>>;

const e1 = hot('--a--b--|');
const messages = getMessages(e1.mapTo('x'));

//at this moment, messages are empty!
assert(messages.length === 0);
```

It is important to note at the moment of getting metadata array, it is not filled with actual value but just empty array. Scheduler should be flushed to fill in values.

```typescript
const e1 = hot('    --a--b--|');
const expected = e('--x--x--|')
const subs = s(`    ^       !`);
const messages = getMessages(e1.mapTo('x'));

//at this moment, messages are empty!
expect(messages).to.be.empty;

flush();

//now values are available
expect(messages).to.deep.equal(expected);
//subscriptions are also available too
expect(e1.subscriptions).to.deep.equal(subs);
```

Or if you need to control timeframe instead of flush out whole at once, you can use `advanceTo` as well.

```typescript
const e1 = hot('    --a--b--|');
const subs = s(`    ^       !`);
const messages = getMessages(e1.mapTo('x'));

//at this moment, messages are empty!
expect(messages).to.be.empty;

advanceTo(3);
const expected = e('--x------'); // we're flushing to frame 3 only, so rest of marbles are not constructed

//now values are available
expect(messages).to.deep.equal(expected);
//subscriptions are also available too
expect(e1.subscriptions).to.deep.equal(subs);
```

#### Flushing scheduler automatically

By default sandbox instance requires to `flush()` explicitly to execute observables. For cases each test case doesn't require to schedule multiple observables but only need to test single, we can create sandbox instance to flush automatically. Since it flushes scheduler as soon as `getMessages` being called, subsequent `getMessages` call will raise errors.

```typescript
const { hot, e } = rxSandbox.create(true);

const e1 = hot('    --a--b--|');
const expected = e('--x--x--|')
const messages = getMessages(e1.mapTo('x'));

//without flushing, observable immeditealy executes and values are available.
expect(messages).to.deep.equal(expected);

//subsequent attempt will throw
expect(() => getMessages(e1.mapTo('y'))).to.throw();

```

#### Custom frame time factor

Each timeframe `-` is predefined to `1`, can be overridden.

```typescript
const { e } = rxSandbox.create(false, 10);

const expected = e('--x--x--|');

// now each frame takes 10
expect(expected[0].frame).to.equal(20);
```

#### Custom assertion for marble diagram

Messages generated by `rxSandbox` is plain object array, so any kind of assertion can be used. In addition to those, `rxSandbox` provides own custom assertion method `marbleAssert` for easier marble diagram diff.

```typescript
marbleAssert<T = string>(source: Array<SubscriptionLog | TestMessage<T>>): { to: { equal(expected: Array<SubscriptionLog | TestMessage<T>>): void } }
```

It accepts array of test messages generated by `getMessages` and `e`, or subscription log by `Hot/ColdObservable.subscriptions` or `s` (in case of utility method `s` it returns single subscription, so need to be constructed as array).

```typescript
import { rxSandbox } from 'rx-sandbox';
const { marbleAssert } = rxSandbox;

const {hot, e, s, getMessages, flush} = rxSandbox.create();

const source = hot('---a--b--|');
const expected = e('---x--x---|');
const sub = s('^-----!');

const messages = getMessages(source.mapTo('x'));
flush();

marbleAssert(messages).to.equal(expected);
marbleAssert(source.subscriptions).to.equal([sub]);
```

When assertion fails, it'll display visual / object diff with raw object values for easier debugging.

**Assert Observable marble diagram**

<img src="https://user-images.githubusercontent.com/1210596/29504109-186ac83a-85f2-11e7-8fd1-b65cef4a7803.png" width="600">

**Assert subscription log marble diagram**

<img src="https://user-images.githubusercontent.com/1210596/29504117-291c5ebe-85f2-11e7-939f-986f2d400b4f.png" width="600">

# Building / Testing

Few npm scripts are supported for build / test code.

- `build`: Transpiles code to ES5 commonjs to `dist`.
- `build:clean`: Clean up existing build
- `test`: Run unit test. Does not require `build` before execute test.
- `lint`: Run lint over all codebases
- `lint:staged`: Run lint only for staged changes. This'll be executed automatically with precommit hook.
- `commit`: Commit wizard to write commit message
