import { CxEntry, cxSingle, CxValues } from '@proc7ts/context-values';
import { Unit } from './unit';
import { UnitOrigin } from './unit-origin';

export interface UnitContext<TUnit extends Unit = any> extends UnitOrigin, CxValues {

  readonly unit: TUnit;

}

export const UnitContext: CxEntry<UnitContext> = {
  perContext: (/*#__PURE__*/ cxSingle()),
  toString: () => '[UnitContext]',
};
