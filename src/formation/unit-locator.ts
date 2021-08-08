import { CxEntry, cxScoped, cxSingle } from '@proc7ts/context-values';
import { Unit } from '../unit';
import { FormationContext } from './formation-context';
import { UnitLocation } from './unit-location';

/**
 * Unit locator helps detect the formation(s) the unit deployed at.
 */
export interface UnitLocator {

  /**
   * Detects the location of the unit.
   *
   * @param unit - Target unit.
   *
   * @returns Unit location.
   */
  locateUnit(unit: Unit): UnitLocation;

}

/**
 * Formation context entry containing unit locator instance.
 */
export const UnitLocator: CxEntry<UnitLocator> = {
  perContext: (/*#__PURE__*/ cxScoped(
      FormationContext,
      (/*#__PURE__*/ cxSingle()),
  )),
  toString: () => '[UnitLocator]',
};
