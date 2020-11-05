/**
 * RxSandbox uses couple of undocumented internal api surface in rxjs.
 * This module reexports internal and its types.
 *
 * Since rxjs core does not export these interfaces directly,
 * types are force augmented via ambient.ts
 */
import './ambient';

import { COMPLETE_NOTIFICATION, errorNotification, nextNotification } from 'rxjs/dist/cjs/internal/Notification';
import { AsyncAction } from 'rxjs/dist/cjs/internal/scheduler/AsyncAction';
import { ColdObservable } from 'rxjs/dist/cjs/internal/testing/ColdObservable';
import { HotObservable } from 'rxjs/dist/cjs/internal/testing/HotObservable';
import { SubscriptionLog } from 'rxjs/dist/cjs/internal/testing/SubscriptionLog';

export {
  SubscriptionLog,
  COMPLETE_NOTIFICATION,
  errorNotification,
  nextNotification,
  HotObservable,
  ColdObservable,
  AsyncAction,
};
