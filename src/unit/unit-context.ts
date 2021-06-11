import { ContextKey, ContextKey__symbol, ContextValues } from '@proc7ts/context-values';
import { Formation } from '../formation';
import { Unit } from './unit';
import { UnitContext__key } from './unit.key.impl';

export abstract class UnitContext<TUnit extends Unit = any> extends ContextValues {

  static get [ContextKey__symbol](): ContextKey<UnitContext> {
    return UnitContext__key;
  }

  abstract readonly formation: Formation;

  abstract readonly unit: TUnit;

}
