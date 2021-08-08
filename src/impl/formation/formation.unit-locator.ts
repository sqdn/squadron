import { CxAsset, CxEntry } from '@proc7ts/context-values';
import { mapOn_, OnEvent } from '@proc7ts/fun-events';
import { Formation, UnitLocation, UnitLocator } from '../../formation';
import { Unit } from '../../unit';
import { UnitLocationRequest, UnitLocationResponse } from '../hub';
import { FormationToHubCommChannel } from './formation-to-hub.comm-channel';

export class FormationUnitLocator implements UnitLocator {

  static get entry(): CxEntry<UnitLocator> {
    return UnitLocator;
  }

  static buildAsset(
      target: CxEntry.Target<UnitLocator>,
  ): (this: void, collector: CxAsset.Collector<UnitLocator>) => void {

    const locator = new FormationUnitLocator(target);

    return collector => collector(locator);
  }

  readonly #formation: Formation;
  readonly #hubChannel: FormationToHubCommChannel;

  private constructor(target: CxEntry.Target<UnitLocator>) {
    this.#formation = target.get(Formation);
    this.#hubChannel = target.get(FormationToHubCommChannel);
  }

  locateUnit(unit: Unit): OnEvent<[UnitLocation]> {
    return this.#hubChannel.request<UnitLocationRequest, UnitLocationResponse>(
        'unit-location',
        { unit: unit.uid },
    ).do(
        mapOn_(response => new FormationUnitLocation(this.#formation, response)),
    );
  }

}

class FormationUnitLocation implements UnitLocation {

  readonly #formations = new Map<string, Formation>();
  readonly #isLocal: boolean;

  constructor(formation: Formation, { formations }: UnitLocationResponse) {
    for (const id of formations) {
      this.#formations.set(id, new Formation({ id }));
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
