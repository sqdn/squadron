import { DueLog } from '@proc7ts/logger';
import { SqdnLoggable } from './sqdn-loggable';

/**
 * A message about to be logged to Squadron log.
 *
 * Adds optional Squadron-specific properties atop of `DueLog`, which makes it compatible with `DueLogZ` in case the
 * logging performed by [@run-z/log-z].
 *
 * [@run-z/log-z]: https://www.npmjs.com/package/@run-z/log-z
 */
export interface DueSqdnLog extends DueLog {
  /**
   * Log message details to process and log.
   *
   * Can be modified or replaced to change the final message details.
   *
   * When missing, the message is not processed by [@run-z/log-z]. An {@link SqdnLoggable} instance should not perform
   * any `log-z`- specific processing in this case.
   *
   * [@run-z/log-z]: https://www.npmjs.com/package/@run-z/log-z
   */
  zDetails?: SqdnLoggable.Details;
}

export namespace DueSqdnLog {
  /**
   * A message to process before being logged by logger.
   *
   * Has the same structure as {@link DueSqdnLog} but some properties may be initially omitted.
   */
  export interface Target extends DueLog.Target {
    /**
     * Log message details to process and log.
     *
     * Can be modified or replaced to change the final message details.
     *
     * When missing, the message is not processed by `log-z`. An {@link SqdnLoggable} instance should not perform any
     * `log-z`- specific processing in this case.
     */
    zDetails?: Record<string | symbol, unknown>;
  }
}
