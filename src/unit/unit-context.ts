import { CxEntry, cxSingle, CxValues } from '@proc7ts/context-values';
import { AfterEvent } from '@proc7ts/fun-events';
import { Unit } from './unit';
import { UnitOrigin } from './unit-origin';
import { UnitStatus } from './unit-status';

/**
 * Unit execution context.
 *
 * Context becomes available within formation the unit deployed to.
 */
export interface UnitContext<TUnit extends Unit = any> extends UnitOrigin, CxValues {

  /**
   * Target unit.
   */
  readonly unit: TUnit;

  /**
   * An `AfterEvent` keeper of current status of the unit.
   */
  readonly readStatus: AfterEvent<[UnitStatus]>;

}

/**
 * Unit context entry containing context instance itself.
 */
export const UnitContext: CxEntry<UnitContext> = {
  perContext: (/*#__PURE__*/ cxSingle()),
  toString: () => '[UnitContext]',
};
