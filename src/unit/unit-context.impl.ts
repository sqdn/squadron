import { ContextRegistry } from '@proc7ts/context-values';
import { Formation } from '../formation';
import { Formation$Host } from '../impl';
import { Unit } from './unit';
import { UnitContext } from './unit-context';
import { UnitContext__key } from './unit.key.impl';

export function newUnitContext<TUnit extends Unit>(host: Formation$Host, unit: TUnit): UnitContext<TUnit> {
  if (host.formation.uid === unit.uid) {
    return host.context as UnitContext;
  }

  const { formation } = host;
  const registry = new ContextRegistry<UnitContext<TUnit>>(host.perUnitRegistry.seeds());
  const values = registry.newValues();

  class Unit$Context extends UnitContext<TUnit> {

    readonly get: UnitContext<TUnit>['get'] = values.get;

    get formation(): Formation {
      return formation;
    }

    get unit(): TUnit {
      return unit;
    }

  }

  const context = new Unit$Context();

  registry.provide({ a: UnitContext__key, is: context });

  return context;
}
