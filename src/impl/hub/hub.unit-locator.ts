import { cxConstAsset } from '@proc7ts/context-builder';
import { CxEntry } from '@proc7ts/context-values';
import { mapAfter, mapAfter_, OnEvent } from '@proc7ts/fun-events';
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
    this.#orderUnits = this.#host.formation.createdIn.get(OrderUnits);
  }

  locateUnit(unit: Unit): OnEvent<[UnitLocation]> {
    return this.#host.trackDeployments(unit).read.do(
        mapAfter(formations => new Hub$UnitLocation(this.#host, formations)),
    );
  }

  #locateUnit({ unit }: UnitLocationCommRequest): OnEvent<[UnitLocationCommResponse]> {
    return this.#host.trackDeployments(this.#orderUnits.unitByUid(unit, Unit)).read.do(
        mapAfter_(formations => ({ formations: [...formations.keys()] })),
    );
  }

}

class Hub$UnitLocation implements UnitLocation {

  readonly #host: Formation$Host;
  readonly #formations: ReadonlyMap<string, Formation>;

  constructor(host: Formation$Host, formations: ReadonlyMap<string, Formation>) {
    this.#host = host;
    this.#formations = formations;
  }

  get formations(): readonly Formation[] {
    return [...this.#formations.values()];
  }

  get isLocal(): boolean {
    return this.isDeployedAt(this.#host.formation);
  }

  isDeployedAt(formation: Formation): boolean {
    return this.#formations.has(formation.uid);
  }

}
