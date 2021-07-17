import { CxEntry, cxSingle, CxValues } from '@proc7ts/context-values';
import { Formation } from '../formation';
import { Unit } from './unit';

export interface UnitContext<TUnit extends Unit = any> extends CxValues {

  readonly formation: Formation;

  readonly unit: TUnit;

}

export const UnitContext: CxEntry<UnitContext> = {
  perContext: (/*#__PURE__*/ cxSingle()),
  toString: () => '[UnitContext]',
};
