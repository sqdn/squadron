import { cxBuildAsset, CxBuilder, cxConstAsset } from '@proc7ts/context-builder';
import { CxAccessor, CxGlobals } from '@proc7ts/context-values';
import Order from '@sqdn/order';
import { Formation$Host } from '../impl';
import { UnitContext__entry } from '../unit/unit.entries.impl';
import { Formation } from './formation';
import { FormationContext } from './formation-context';
import { Formation__entry, FormationContext__entry } from './formation.entries.impl';

export function FormationContext$create(
    host: Formation$Host,
    get: CxAccessor,
    cxBuilder: CxBuilder<FormationContext>,
    createFormation: (this: void, order: Order) => Formation,
): FormationContext {

  class Formation$Context implements FormationContext {

    readonly get = get;

    get formation(): Formation {
      return host.formation;
    }

    get unit(): Formation {
      return host.formation;
    }

  }

  const context = new Formation$Context();

  cxBuilder.provide(cxConstAsset(CxGlobals, context));
  cxBuilder.provide(cxConstAsset(Formation$Host, host));
  cxBuilder.provide(cxBuildAsset(Formation__entry, _target => createFormation(Order)));
  cxBuilder.provide(cxConstAsset(FormationContext__entry, context));
  cxBuilder.provide(cxConstAsset(UnitContext__entry, context));

  return context;
}
