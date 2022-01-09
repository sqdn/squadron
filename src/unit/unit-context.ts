import { CxEntry, cxSingle, CxValues } from '@proc7ts/context-values';
import { AfterEvent } from '@proc7ts/fun-events';
import { Formation } from '../formation';
import { Hub } from '../hub';
import { Unit } from './unit';
import { UnitStatus } from './unit-status';

/**
 * Unit operations' context.
 *
 * Context becomes available within formation the unit arrived to.
 */
export interface UnitContext<TUnit extends Unit = any> extends CxValues {

  /**
   * The hub reference the unit created by.
   */
  readonly hub: Hub;

  /**
   * The formation reference the unit arrived to.
   */
  readonly formation: Formation;

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
 * Unit context entry containing the context instance itself.
 */
export const UnitContext: CxEntry<UnitContext> = {
  perContext: (/*#__PURE__*/ cxSingle()),
  toString: () => '[UnitContext]',
};
