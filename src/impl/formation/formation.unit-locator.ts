import { CxAsset, CxEntry } from '@proc7ts/context-values';
import { mapOn_, OnEvent } from '@proc7ts/fun-events';
import { Formation, UnitLocation, UnitLocator } from '../../formation';
import { OrderUnits, Unit } from '../../unit';
import { UnitLocationRequest, UnitLocationResponse } from '../hub';
import { Formation$CtlChannel } from './formation.ctl-channel';

export class Formation$UnitLocator implements UnitLocator {

  static get entry(): CxEntry<UnitLocator> {
    return UnitLocator;
  }

  static buildAsset(
      target: CxEntry.Target<UnitLocator>,
  ): (this: void, collector: CxAsset.Collector<UnitLocator>) => void {

    const locator = new Formation$UnitLocator(target);

    return collector => collector(locator);
  }

  readonly #formation: Formation;
  readonly #ctlChannel: Formation$CtlChannel;

  private constructor(target: CxEntry.Target<UnitLocator>) {
    this.#formation = target.get(Formation);
    this.#ctlChannel = target.get(Formation$CtlChannel);
  }

  locateUnit(unit: Unit): OnEvent<[UnitLocation]> {
    return this.#ctlChannel.request<UnitLocationRequest, UnitLocationResponse>(
        'unit-location',
        { unit: unit.uid },
    ).do(
        mapOn_(response => new Formation$UnitLocation(this.#formation, response)),
    );
  }

}

class Formation$UnitLocation implements UnitLocation {

  readonly #formations = new Map<string, Formation>();
  readonly #isLocal: boolean;

  constructor(
      formation: Formation,
      { formations }: UnitLocationResponse,
  ) {

    const orderUnits = formation.order.get(OrderUnits);

    for (const uid of formations) {
      this.#formations.set(uid, orderUnits.unitByUid(uid, Formation));
    }

    this.#isLocal = this.#formations.has(formation.uid);
  }

  get formations(): readonly Formation[] {
    return [...this.#formations.values()];
  }

  get isLocal(): boolean {
    return this.#isLocal;
  }

  isDeployedAt(formation: Formation): boolean {
    return this.#formations.has(formation.uid);
  }

}
