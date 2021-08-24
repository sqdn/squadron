import { CxBuilder, cxConstAsset } from '@proc7ts/context-builder';
import { CxAccessor, CxEntry, CxRequest } from '@proc7ts/context-values';
import { AfterEvent } from '@proc7ts/fun-events';
import { Formation } from '../formation';
import { Hub } from '../hub';
import { Unit } from './unit';
import { UnitContext } from './unit-context';
import { UnitStatus } from './unit-status';
import { Unit$Deployment } from './unit.deployment.impl';
import { UnitContext__entry } from './unit.entries.impl';

export function UnitContext$createBuilder<TUnit extends Unit>(
    deployment: Unit$Deployment<TUnit>,
): CxBuilder<UnitContext<TUnit>> {

  const { host, unit } = deployment;

  if (host.formation.uid === unit.uid) {
    return host.formationBuilder as CxBuilder<UnitContext>;
  }

  return new CxBuilder<UnitContext<TUnit>>(
      (get, builder) => new Unit$Context(deployment, get, builder),
      host.perUnitCxPeer,
  );
}

class Unit$Context<TUnit extends Unit> implements UnitContext<TUnit> {

  readonly #deployment: Unit$Deployment<TUnit>;
  readonly #get: CxAccessor;

  constructor(
      deployment: Unit$Deployment<TUnit>,
      get: CxAccessor,
      builder: CxBuilder<UnitContext<TUnit>>,
  ) {
    this.#deployment = deployment;
    this.#get = get;
    builder.provide(cxConstAsset(UnitContext__entry, this));
    builder.supply.as(deployment);
  }

  get hub(): Hub {
    return this.#deployment.host.hub;
  }

  get formation(): Formation {
    return this.#deployment.host.formation;
  }

  get unit(): TUnit {
    return this.#deployment.unit;
  }

  get readStatus(): AfterEvent<[UnitStatus]> {
    return this.#deployment.readStatus;
  }

  get<TValue>(entry: CxEntry<TValue, unknown>, request?: CxRequest<TValue>): TValue | null {
    return this.#get(entry, request);
  }

}
