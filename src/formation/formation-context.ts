import { ContextKey, ContextKey__symbol, ContextValues } from '@proc7ts/context-values';
import { UnitContext } from '../unit';
import { Formation } from './formation';
import { FormationContext__key } from './formation.key.impl';

export abstract class FormationContext extends ContextValues implements UnitContext<Formation> {

  static get [ContextKey__symbol](): ContextKey<FormationContext> {
    return FormationContext__key;
  }

  abstract readonly formation: Formation;

  abstract readonly unit: Formation;

}
