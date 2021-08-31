import { CxEntry, cxSingle } from '@proc7ts/context-values';
import { Unit, UnitContext } from '../unit';
import { Formation } from './formation';

/**
 * Formation operations context.
 *
 * Exactly one formation context instance available per formation worker.
 */
export interface FormationContext extends UnitContext<Formation> {

  /**
   * The formation instance.
   */
  readonly formation: Formation;

  /**
   * Target unit, the same as {@link formation}.
   */
  readonly unit: Formation;

  /**
   * Obtains context of the given unit.
   *
   * The requested unit expected to be deployed withing this formation. This is not required however. E.g. the unit
   * context may be requested prior to unit deployment.
   *
   * @param unit - Target unit.
   *
   * @returns Unit context.
   */
  unitContext<TUnit extends Unit>(unit: TUnit): UnitContext<TUnit>;

}

/**
 * Order, formation, or unit context entry containing the formation context instance.
 */
export const FormationContext: CxEntry<FormationContext> = {
  perContext: (/*#__PURE__*/ cxSingle()),
  toString: () => '[FormationContext]',
};
