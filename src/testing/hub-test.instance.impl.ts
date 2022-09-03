import { cxConstAsset } from '@proc7ts/context-builder';
import { Logger } from '@proc7ts/logger';
import { MessageChannel } from 'node:worker_threads';
import { CommChannel, MessageCommChannel } from '../communication';
import { Formation } from '../formation';
import { FormationStarter, FormationStartOptions } from '../hub';
import { Formation$createAssets } from '../impl/formation';
import { Hub$createAssets } from '../impl/hub';
import { FormationTest } from './formation-test';
import { FormationTest$Nested } from './formation-test.nested.impl';
import { HubTest } from './hub-test';
import { OrderTest } from './order-test';
import { OrderTest$defaultHub, OrderTest$Instance } from './order-test.instace.impl';

export class HubTest$Instance extends OrderTest$Instance implements HubTest {

  readonly #fmnTests = new Map<string, FormationTest$Nested>();

  constructor(init?: HubTest.Init) {
    super(HubTest$init(init));
    this.formationBuilder.provide(Hub$createAssets());
    this.formationBuilder.provide(
      cxConstAsset(FormationStarter, {
        startFormation: this.#startFormation.bind(this),
      }),
    );
  }

  testFormation(formation: Formation, init?: FormationTest.Init): FormationTest {
    let fmnTest = this.#fmnTests.get(formation.uid);

    if (!fmnTest) {
      fmnTest = new FormationTest$Nested(this, formation, init);
      this.#fmnTests.set(formation.uid, fmnTest);
      fmnTest.initOrder();
    }

    return fmnTest;
  }

  #startFormation(formation: Formation, { processor }: FormationStartOptions): CommChannel {
    const fmnTest = this.testFormation(formation);
    const { port1, port2 } = new MessageChannel();

    fmnTest.supply.whenOff(() => {
      port1.close();
      port2.close();
    });
    fmnTest.formationBuilder.provide(
      Formation$createAssets({
        uid: fmnTest.formation.uid,
        hubUid: fmnTest.hub.uid,
        hubPort: port2,
      }),
    );

    return new MessageCommChannel({
      to: formation,
      port: port1,
      processor,
      logger: this.formationBuilder.context.get(Logger),
    });
  }

}

function HubTest$init(init: HubTest.Init = {}): OrderTest.Init {
  const { createHub = createdIn => OrderTest$defaultHub(createdIn) } = init;

  return {
    ...init,
    createOrigin(createdIn, builtBy) {
      const hub = createHub(createdIn, builtBy);

      return {
        hub,
        formation: hub,
      };
    },
  };
}
