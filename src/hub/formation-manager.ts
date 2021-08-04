import { CxEntry, cxScoped, cxSingle } from '@proc7ts/context-values';
import { Formation, FormationContext } from '../formation';
import { FormationCtl } from './formation-ctl';
import { Hub } from './hub';

export interface FormationManager {

  readonly hub: Hub;

  formationCtl(formation: Formation): FormationCtl;

}

export const FormationManager: CxEntry<FormationManager> = {
  perContext: (/*#__PURE__*/ cxScoped(
      FormationContext,
      (/*#__PURE__*/ cxSingle()),
  )),
  toString: () => '[FormationManager]',
};
