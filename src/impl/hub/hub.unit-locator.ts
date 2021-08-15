import { cxConstAsset } from '@proc7ts/context-builder';
import { CxEntry } from '@proc7ts/context-values';
import { afterThe, OnEvent, onEventBy } from '@proc7ts/fun-events';
import { CommProtocol } from '../../communication';
import { Formation, UnitLocation, UnitLocator } from '../../formation';
import { OrderUnits, Unit } from '../../unit';
import { Formation$Host } from '../formation.host';
import { UnitLocationCommRequest, UnitLocationCommResponse } from '../packets';

export class Hub$UnitLocator implements UnitLocator {

  static get entry(): CxEntry<UnitLocator> {
    return UnitLocator;
  }

  static setupAsset(target: CxEntry.Target<UnitLocator>): void {

    const locator = new Hub$UnitLocator(target);

    target.provide(cxConstAsset(UnitLocator, locator));
    target.provide(cxConstAsset(
        CommProtocol,
        {
          name: UnitLocationCommRequest,
          respond: (request: UnitLocationCommRequest) => locator.#locateUnit(request),
        },
    ));
  }

  readonly #host: Formation$Host;
  readonly #orderUnits: OrderUnits;

  private constructor(target: CxEntry.Target<UnitLocator>) {
    this.#host = target.get(Formation$Host);
    this.#orderUnits = this.#host.formation.order.get(OrderUnits);
  }

  locateUnit(unit: Unit): OnEvent<[UnitLocation]> {
    return afterThe(new Hub$UnitLocation(this.#host, unit));
  }

  #locateUnit({ unit }: UnitLocationCommRequest): OnEvent<[UnitLocationCommResponse]> {
    return onEventBy(() => ({
      formations: this.#host.unitFormations(this.#orderUnits.unitByUid(unit, Unit)).map(({ uid }) => uid),
    }));
  }

}

class Hub$UnitLocation implements UnitLocation {

  readonly #host: Formation$Host;
  readonly #unit: Unit;

  constructor(host: Formation$Host, unit: Unit) {
    this.#host = host;
    this.#unit = unit;
  }

  get formations(): readonly Formation[] {
    return this.#host.unitFormations(this.#unit);
  }

  get isLocal(): boolean {
    return this.#host.isLocalUnit(this.#unit);
  }

  isDeployedAt(formation: Formation): boolean {
    return this.#host.isUnitDeployedAt(this.#unit, formation);
  }

}
