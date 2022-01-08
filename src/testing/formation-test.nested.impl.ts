import { Supply } from '@proc7ts/supply';
import { Formation } from '../formation';
import { FormationManager, Hub } from '../hub';
import { OrderUnits, Unit } from '../unit';
import { FormationTest } from './formation-test';
import { HubTest } from './hub-test';
import { HubTest$Instance } from './hub-test.instance.impl';
import { OrderTest } from './order-test';
import { OrderTest$Instance } from './order-test.instace.impl';

export class FormationTest$Nested extends OrderTest$Instance implements FormationTest {

  readonly #hubTest: HubTest;
  readonly #hubFormation: Formation;

  constructor(
      hubTest: HubTest$Instance,
      formation: Formation,
      init?: FormationTest.Init,
  ) {
    super(FormationTest$init(hubTest, formation, init));
    this.#hubTest = hubTest;
    this.#hubFormation = formation;
  }

  init(): this {
    // Establish communication.
    void this.#hubTest.formationBuilder.get(FormationManager).formationCtl(this.#hubFormation).channel;

    return this;
  }

  deploy<TUnit extends Unit>(unit: TUnit): TUnit {
    this.#hubFormation.deploy(unit);

    const fmnUnit = this.createdIn
        .get(OrderUnits)
        .unitByUid(unit.uid, unit.constructor as new (init?: Unit.Init) => TUnit);

    this.formation.deploy(fmnUnit);

    return fmnUnit;
  }

}

function FormationTest$init(
    hubTest: HubTest$Instance,
    formation: Formation,
    init: FormationTest.Init = {},
): OrderTest.Init {

  const { supply = new Supply() } = init;

  return {
    ...init,
    supply: supply.needs(hubTest),
    newOrigin(createdIn) {
      return {
        hub: new Hub({ id: hubTest.hub.uid, createdIn }),
        formation: new Formation({ id: formation.uid, createdIn }),
      };
    },
  };
}
