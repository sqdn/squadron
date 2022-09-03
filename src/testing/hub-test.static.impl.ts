import { Formation } from '../formation';
import { FormationTest } from './formation-test';
import { HubTest } from './hub-test';
import { HubTest$Instance } from './hub-test.instance.impl';
import { OrderTest$get, OrderTest$set } from './order-test.instace.impl';
import { OrderTest$StaticBase } from './order-test.static.impl';

export class HubTest$Static extends OrderTest$StaticBase<HubTest> implements HubTest.Static {

  constructor() {
    super(() => (OrderTest$get() as HubTest$Instance) || HubTest$setup());
  }

  setup(init?: HubTest.Init): HubTest {
    return HubTest$setup(init);
  }

  testFormation(formation: Formation, init?: FormationTest.Init): FormationTest {
    return this.test.testFormation(formation, init);
  }

}

function HubTest$setup(init?: HubTest.Init): HubTest {
  return OrderTest$set(new HubTest$Instance(init)).initOrder();
}
