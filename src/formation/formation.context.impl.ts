import { cxBuildAsset, CxBuilder, cxConstAsset } from '@proc7ts/context-builder';
import { CxAccessor, CxEntry, CxGlobals, CxRequest } from '@proc7ts/context-values';
import { Hub } from '../hub';
import { Formation$Host } from '../impl';
import { UnitContext__entry } from '../unit/unit.entries.impl';
import { Formation } from './formation';
import { FormationContext } from './formation-context';
import { Formation__entry, FormationContext__entry } from './formation.entries.impl';

export class Formation$Context implements FormationContext {

  readonly #host: Formation$Host;
  readonly #get: CxAccessor;

  constructor(
      host: Formation$Host,
      get: CxAccessor,
      cxBuilder: CxBuilder<FormationContext>,
  ) {
    this.#host = host;
    this.#get = get;
    cxBuilder.provide(cxConstAsset(CxGlobals, this));
    cxBuilder.provide(cxConstAsset(Formation$Host, host));
    cxBuilder.provide(cxBuildAsset(Formation__entry, _target => host.formation));
    cxBuilder.provide(cxConstAsset(FormationContext__entry, this));
    cxBuilder.provide(cxConstAsset(UnitContext__entry, this));
  }

  get hub(): Hub {
    return this.#host.hub;
  }

  get formation(): Formation {
    return this.#host.formation;
  }

  get unit(): Formation {
    return this.formation;
  }

  get<TValue>(entry: CxEntry<TValue, unknown>, request?: CxRequest<TValue>): TValue | null {
    return this.#get(entry, request);
  }

}
