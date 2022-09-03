import { Loggable } from '@proc7ts/logger';
import { DueSqdnLog } from './due-sqdn-log';

/**
 * A value that may be logged by Squadron logger in a custom way.
 *
 * Implementing it makes loggable value compatible with [@run-z/log-z].
 *
 * [@run-z/log-z]: https://www.npmjs.com/package/@run-z/log-z
 *
 * @typeParam TTarget - Processed message type.
 */
export interface SqdnLoggable<TTarget extends DueSqdnLog.Target = DueSqdnLog.Target>
  extends Loggable<TTarget> {
  toLog(target: TTarget): void | unknown;
}

export namespace SqdnLoggable {
  /**
   * Squadron log message details to process and log.
   */
  export interface Details {
    unit?: {
      name: string;
      uid: string;
      src: string;
    };

    [key: string | symbol]: unknown | undefined;
  }
}
