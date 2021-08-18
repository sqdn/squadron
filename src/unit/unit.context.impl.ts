import { CxBuilder, cxConstAsset } from '@proc7ts/context-builder';
import { CxAccessor, CxEntry, CxRequest } from '@proc7ts/context-values';
import { Formation } from '../formation';
import { Hub } from '../hub';
import { Formation$Host } from '../impl';
import { Unit } from './unit';
import { UnitContext } from './unit-context';
import { UnitContext__entry } from './unit.entries.impl';

export function UnitContext$createBuilder<TUnit extends Unit>(
    host: Formation$Host,
    unit: TUnit,
): CxBuilder<UnitContext<TUnit>> {
  if (host.formation.uid === unit.uid) {
    return host.formationBuilder as CxBuilder<UnitContext>;
  }

  return new CxBuilder<UnitContext<TUnit>>(
      (get, builder) => new Unit$Context(host, unit, get, builder),
      host.perUnitCxPeer,
  );
}

class Unit$Context<TUnit extends Unit> implements UnitContext<TUnit> {

  readonly #host: Formation$Host;
  readonly #unit: TUnit;
  readonly #get: CxAccessor;

  constructor(host: Formation$Host, unit: TUnit, get: CxAccessor, builder: CxBuilder<UnitContext<TUnit>>) {
    this.#host = host;
    this.#unit = unit;
    this.#get = get;
    builder.provide(cxConstAsset(UnitContext__entry, this));
    builder.supply.as(unit);
  }

  get hub(): Hub {
    return this.#host.hub;
  }

  get formation(): Formation {
    return this.#host.formation;
  }

  get unit(): TUnit {
    return this.#unit;
  }

  get<TValue>(entry: CxEntry<TValue, unknown>, request?: CxRequest<TValue>): TValue | null {
    return this.#get(entry, request);
  }

}
