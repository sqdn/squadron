import { CxEntry, cxSingle } from '@proc7ts/context-values';
import { UnitContext } from '../unit';
import { Formation } from './formation';

export interface FormationContext extends UnitContext<Formation> {

  readonly formation: Formation;

  readonly unit: Formation;

}

export const FormationContext: CxEntry<FormationContext> = {
  perContext: (/*#__PURE__*/ cxSingle()),
  toString: () => '[FormationContext]',
};
