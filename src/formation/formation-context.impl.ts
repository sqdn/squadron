import Order from '@sqdn/order';
import { Formation$Host } from '../impl';
import { UnitContext__key } from '../unit/unit.key.impl';
import { Formation } from './formation';
import { FormationContext } from './formation-context';
import { Formation__key, FormationContext__key } from './formation.key.impl';

export function newFormationContext(
    host: Formation$Host,
    createFormation: (this: void, order: Order) => Formation,
): FormationContext {

  const { registry } = host;

  registry.provide({
    a: Formation__key,
    by: (_context: FormationContext) => createFormation(Order),
  });

  const values = registry.newValues();

  class Formation$Context extends FormationContext {

    readonly get = values.get;

    get formation(): Formation {
      return host.formation;
    }

    get unit(): Formation {
      return host.formation;
    }

  }

  const context = new Formation$Context();

  registry.provide({ a: FormationContext__key, is: context });
  registry.provide({ a: UnitContext__key, is: context });

  return context;
}
