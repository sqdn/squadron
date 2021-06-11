import { Formation$Host } from '../impl';
import { UnitContext__key } from '../unit/unit.key.impl';
import { Formation } from './formation';
import { FormationContext } from './formation-context';
import { Formation__key, FormationContext__key } from './formation.key.impl';

export function newFormationContext(host: Formation$Host): FormationContext {

  const { formation, registry } = host;

  registry.provide({ a: Formation__key, is: host.formation });

  const values = registry.newValues();

  class Formation$Context extends FormationContext {

    readonly get = values.get;

    get formation(): Formation {
      return formation;
    }

    get unit(): Formation {
      return formation;
    }

  }

  const context = new Formation$Context();

  registry.provide({ a: FormationContext__key, is: context });
  registry.provide({ a: UnitContext__key, is: context });

  return context;
}
