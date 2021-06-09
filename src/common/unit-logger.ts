import { ContextRef, SingleContextKey } from '@proc7ts/context-values';
import { consoleLogger, Logger } from '@proc7ts/logger';

export type UnitLogger = Logger;

export const UnitLogger: ContextRef<UnitLogger> = (/*#__PURE__*/ new SingleContextKey(
    'unit-logger',
    {
      byDefault: _context => consoleLogger,
    },
));
