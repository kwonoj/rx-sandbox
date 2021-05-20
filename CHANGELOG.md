## [2.0.2](https://github.com/kwonoj/rx-sandbox/compare/v2.0.1...v2.0.2) (2021-05-18)


### Bug Fixes

* **testmessage:** wide notificationtype<T> ([b167aff](https://github.com/kwonoj/rx-sandbox/commit/b167affd8fb9e3a63e0cc747f362e9b78f85e2a1))



## [2.0.1](https://github.com/kwonoj/rx-sandbox/compare/v2.0.0...v2.0.1) (2021-05-18)


### Bug Fixes

* **getmessages:** update return type ([c2037bd](https://github.com/kwonoj/rx-sandbox/commit/c2037bd5048facab8d497dabee06221b03d82494))



# [2.0.0](https://github.com/kwonoj/rx-sandbox/compare/v2.0.0-beta.3...v2.0.0) (2021-05-18)


### Features

* **sandbox:** support v7.0.1 ([3f40757](https://github.com/kwonoj/rx-sandbox/commit/3f407573fc702432029eae865d1c92103e154b73))



# [2.0.0-beta.3](https://github.com/kwonoj/rx-sandbox/compare/v2.0.0-beta.2...v2.0.0-beta.3) (2020-11-06)


### Bug Fixes

* **sandboxinstance:** expose scheduler instance ([6ada7a5](https://github.com/kwonoj/rx-sandbox/commit/6ada7a52c7e9bd25ae83b41eba1e786b194ffc93))


### Features

* **creattestscheduler:** support flush with native async tick ([93a99a4](https://github.com/kwonoj/rx-sandbox/commit/93a99a45bf63698f4e721a75f85fbf22f74eea68))
* **marbleassert:** jasmine style toEqual() matcher ([6dcc7f8](https://github.com/kwonoj/rx-sandbox/commit/6dcc7f89936f971da66e0e4d0b286203b0fa68b9))
* **sandbox:** accept config object ([3464710](https://github.com/kwonoj/rx-sandbox/commit/346471048564667c3a41df256467299fcb43eaa0))
* **sandbox:** expose interface to create async flush scheduler ([f20fb40](https://github.com/kwonoj/rx-sandbox/commit/f20fb4088ae3fb2d3ee8501fa38b392685a67063))
* **sandbox:** support to create async flush instance ([b9c5e71](https://github.com/kwonoj/rx-sandbox/commit/b9c5e71281cc3fd7def2c39ea94ab21c767585a8))


### BREAKING CHANGES

* **sandboxinstance:** scheduler no longer expose `maxFrame` property. use
property returned by `sandbox.create()`.
* **sandbox:** no longer directly export signatures for utilities,
such as `getMessages` due to overloaded signature behaviors. Use
`RxSandboxInstance['name']` or `RxAsyncSandboxInstance['name']` instead
to pick up signatures.



## [1.0.4](https://github.com/kwonoj/rx-sandbox/compare/v1.0.3...v1.0.4) (2020-11-02)


### Bug Fixes

* Closes https://github.com/kwonoj/rx-sandbox/issues/476



# [2.0.0-beta.2](https://github.com/kwonoj/rx-sandbox/compare/v2.0.0-beta.1...v2.0.0-beta.2) (2020-10-23)


### Bug Fixes

* **testmessage:** update types, rx@7 support ([f23cf4d](https://github.com/kwonoj/rx-sandbox/commit/f23cf4d49afd72fe4b870b57adec9f8c6152ba49))


### BREAKING CHANGES

* **sandbox:** require rx >= 7.0.0-beta.8

<a name="2.0.0-beta.1"></a>
# [2.0.0-beta.1](https://github.com/kwonoj/rx-sandbox/compare/v1.0.3...v2.0.0-beta.1) (2020-06-02)


### build

* **tsconfig:** update tsconfig ([748ea40](https://github.com/kwonoj/rx-sandbox/commit/748ea40))


### Features

* **sandbox:** support 7.x ([d8220f8](https://github.com/kwonoj/rx-sandbox/commit/d8220f8))


### BREAKING CHANGES

* **tsconfig:** require es2015 supported runtime
* **sandb8x:** require rx >= 7.x



<a name="1.0.3"></a>
## [1.0.3](https://github.com/kwonoj/rx-sandbox/compare/v1.0.2...v1.0.3) (2019-06-23)


### Bug Fixes

* **create:** relate maxframevalue to frametimefactor ([81587e8](https://github.com/kwonoj/rx-sandbox/commit/81587e8))



<a name="1.0.2"></a>
## [1.0.2](https://github.com/kwonoj/rx-sandbox/compare/v1.0.1...v1.0.2) (2019-01-10)


### Bug Fixes

* **getmarbletokenvalue:** allow `undefined` as token value ([ec318c7](https://github.com/kwonoj/rx-sandbox/commit/ec318c7))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/kwonoj/rx-sandbox/compare/v1.0.0...v1.0.1) (2018-10-13)


### Bug Fixes

* **package:** update jest-matcher-utils to version 23.0.0 ([ede0594](https://github.com/kwonoj/rx-sandbox/commit/ede0594))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/kwonoj/rx-sandbox/compare/v0.0.10...v1.0.0) (2018-05-16)
* **package:** bump up peerdep to rxjs@6 ([085c2b6](https://github.com/kwonoj/rx-sandbox/commit/085c2b6))

### BREAKING CHANGES
* **package:** Import paths are not compatible with rxjs@5 anymore

<a name="0.0.10"></a>
## [0.0.10](https://github.com/kwonoj/rx-sandbox/compare/v0.0.9...v0.0.10) (2018-01-26)


### Bug Fixes

* **tokenparsereducer:** support simultaneous sub-unsub ([e60d6f1](https://github.com/kwonoj/rx-sandbox/commit/e60d6f1))



<a name="0.0.9"></a>
## [0.0.9](https://github.com/kwonoj/rx-sandbox/compare/v0.0.8...v0.0.9) (2017-12-10)


### Bug Fixes

* **flush:** fix hot observable flush order ([c10f1f7](https://github.com/kwonoj/rx-sandbox/commit/c10f1f7))



<a name="0.0.8"></a>
## [0.0.8](https://github.com/kwonoj/rx-sandbox/compare/v0.0.7...v0.0.8) (2017-09-29)


### Features

* **rxsandboxinstance:** export scheduler instance ([09afcc9](https://github.com/kwonoj/rx-sandbox/commit/09afcc9))



<a name="0.0.7"></a>
## [0.0.7](https://github.com/kwonoj/rx-sandbox/compare/v0.0.6...v0.0.7) (2017-09-29)


### Features

* **index:** export types for functions ([c069f86](https://github.com/kwonoj/rx-sandbox/commit/c069f86))



<a name="0.0.6"></a>
## [0.0.6](https://github.com/kwonoj/rx-sandbox/compare/v0.0.5...v0.0.6) (2017-09-26)


### Bug Fixes

* **getmarbletokenvalue:** Check for `undefined` values for given token ([78b34c2](https://github.com/kwonoj/rx-sandbox/commit/78b34c2))



<a name="0.0.5"></a>
## [0.0.5](https://github.com/kwonoj/rx-sandbox/compare/v0.0.4...v0.0.5) (2017-08-27)


### Features

* **advanceto:** implement advanceTo interface ([1d27849](https://github.com/kwonoj/rx-sandbox/commit/1d27849)), closes [#36](https://github.com/kwonoj/rx-sandbox/issues/36)



<a name="0.0.4"></a>
## [0.0.4](https://github.com/kwonoj/rx-sandbox/compare/v0.0.3...v0.0.4) (2017-08-21)


### Bug Fixes

* **marbleassert:** accept subscriptionlog array ([4640bc9](https://github.com/kwonoj/rx-sandbox/commit/4640bc9))


### Features

* **constructobservablemarble:** define interfaces ([5788fb1](https://github.com/kwonoj/rx-sandbox/commit/5788fb1))
* **constructobservablemarble:** implement constructobservablemarble ([fee3d80](https://github.com/kwonoj/rx-sandbox/commit/fee3d80))
* **constructsubscriptionmarble:** implement constructSubscriptionMarble ([527d231](https://github.com/kwonoj/rx-sandbox/commit/527d231))
* **marbleassert:** define assertion interface ([04b27dc](https://github.com/kwonoj/rx-sandbox/commit/04b27dc))
* **marbleassert:** implement marbleAssert ([3822439](https://github.com/kwonoj/rx-sandbox/commit/3822439))
* **observablemarbleassert:** input validation ([29f010e](https://github.com/kwonoj/rx-sandbox/commit/29f010e))
* **subscriptionmarbleassert:** implement subscriptionMarbleAssert ([df823fa](https://github.com/kwonoj/rx-sandbox/commit/df823fa))



<a name="0.0.3"></a>
## [0.0.3](https://github.com/kwonoj/rx-sandbox/compare/v0.0.2...v0.0.3) (2017-08-19)



<a name="0.0.2"></a>
## [0.0.2](https://github.com/kwonoj/rx-sandbox/compare/v0.0.1...v0.0.2) (2017-08-19)


### Bug Fixes

* **parseobservablemarble:** fix subscription offset ([1782f46](https://github.com/kwonoj/rx-sandbox/commit/1782f46))



<a name="0.0.1"></a>
## 0.0.1 (2017-08-19)


### Bug Fixes

* **subscriptiontokenparsereducer:** fix unsubscription frame ([d39e10e](https://github.com/kwonoj/rx-sandbox/commit/d39e10e))
* **testmessagevalue:** loosen generic type of complete ([5640e97](https://github.com/kwonoj/rx-sandbox/commit/5640e97))
* **testscheduler:** correct crection method return ([d0d79de](https://github.com/kwonoj/rx-sandbox/commit/d0d79de))
* **testscheduler:** do not expose advance_ interface ([1158160](https://github.com/kwonoj/rx-sandbox/commit/1158160))
* **testscheduler:** fix return types for creation method ([e943d6f](https://github.com/kwonoj/rx-sandbox/commit/e943d6f))
* **testscheduler:** setup hot observable when flush ([cc7865a](https://github.com/kwonoj/rx-sandbox/commit/cc7865a))


### Features

* **getmarbles:** initial implementation for getmarbles ([d8058e3](https://github.com/kwonoj/rx-sandbox/commit/d8058e3))
* **index:** export rxSandbox ([1d8065e](https://github.com/kwonoj/rx-sandbox/commit/1d8065e))
* **index:** export utility functions ([c42845c](https://github.com/kwonoj/rx-sandbox/commit/c42845c))
* **index:** export utility functions ([68fbbef](https://github.com/kwonoj/rx-sandbox/commit/68fbbef))
* **index:** setup initial index ([5fffa83](https://github.com/kwonoj/rx-sandbox/commit/5fffa83))
* **marbletoken:** define tokens for marble diagram DSL ([9d82b94](https://github.com/kwonoj/rx-sandbox/commit/9d82b94))
* **MessageRecordObserver:** rename VirtualObserver to MessageRecordObserver ([61ee4ee](https://github.com/kwonoj/rx-sandbox/commit/61ee4ee))
* **parseobservablemarble:** define interfaces for parseObservableMarble ([579c679](https://github.com/kwonoj/rx-sandbox/commit/579c679))
* **parseobservablemarble:** parse non grouped values ([3ca4be4](https://github.com/kwonoj/rx-sandbox/commit/3ca4be4))
* **parseobservablemarble:** support expanding timeframe ([87e988f](https://github.com/kwonoj/rx-sandbox/commit/87e988f))
* **parseobservablemarble:** support flatten inner observables ([9cbb534](https://github.com/kwonoj/rx-sandbox/commit/9cbb534))
* **parseobservablemarble:** support grouped value ([7213642](https://github.com/kwonoj/rx-sandbox/commit/7213642))
* **parsesubscriptionmarble:** implement parseSubscriptionMarble ([dc33071](https://github.com/kwonoj/rx-sandbox/commit/dc33071))
* **rxsandbox:** export interfaces ([fbc2933](https://github.com/kwonoj/rx-sandbox/commit/fbc2933))
* **testmessage:** expose TestMessage interface ([0dd9b4b](https://github.com/kwonoj/rx-sandbox/commit/0dd9b4b))
* **testmessagevalue:** implement testmessagevalue ([5e6c656](https://github.com/kwonoj/rx-sandbox/commit/5e6c656))
* **TestMessageValue:** implement TestMessageValue ([59b6e36](https://github.com/kwonoj/rx-sandbox/commit/59b6e36))
* **testscheduler:** define public interfaces ([e4b37bf](https://github.com/kwonoj/rx-sandbox/commit/e4b37bf))
* **testscheduler:** expose createObservable interface ([fe10331](https://github.com/kwonoj/rx-sandbox/commit/fe10331))
* **testscheduler:** implement autoflush ([2f4540f](https://github.com/kwonoj/rx-sandbox/commit/2f4540f))
* **testscheduler:** support subscriptionMarbles ([692d631](https://github.com/kwonoj/rx-sandbox/commit/692d631))
* **VirtualObserver:** implements VirtualObserver ([958e9f2](https://github.com/kwonoj/rx-sandbox/commit/958e9f2))
* **VirtualTestScheduler:** implements initial VirtualTestScheduler interface ([084ea38](https://github.com/kwonoj/rx-sandbox/commit/084ea38))



