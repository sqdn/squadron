import { ContextKey, SingleContextKey } from '@proc7ts/context-values';
import { Formation } from './formation';
import { FormationContext } from './formation-context';

export const Formation__key: ContextKey<Formation> = (/*#__PURE__*/ new SingleContextKey<Formation>('Formation'));
export const FormationContext__key = (/*#__PURE__*/ new SingleContextKey<FormationContext>('FormationContext'));
