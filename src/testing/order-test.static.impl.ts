import { CxBuilder } from '@proc7ts/context-builder';
import { Supply } from '@proc7ts/supply';
import { Formation, FormationContext } from '../formation';
import { Hub } from '../hub';
import { OrderContext } from '../order';
import { OrderTest } from './order-test';
import {
  OrderTest$Instance,
  OrderTest$get,
  OrderTest$reset,
  OrderTest$set,
} from './order-test.instance.impl';

export abstract class OrderTest$StaticBase<TTest extends OrderTest> implements OrderTest {

  readonly #get: () => TTest;

  protected constructor(getTest: () => TTest) {
    this.#get = getTest;
  }

  get test(): TTest {
    return this.#get();
  }

  get hub(): Hub {
    return this.test.hub;
  }

  get formation(): Formation {
    return this.test.formation;
  }

  get formationBuilder(): CxBuilder<FormationContext> {
    return this.test.formationBuilder;
  }

  get createdIn(): OrderContext {
    return this.test.createdIn;
  }

  get builtBy(): CxBuilder<OrderContext> {
    return this.test.builtBy;
  }

  get supply(): Supply {
    return this.test.supply;
  }

  run<TResult>(fn: (this: void, context: OrderContext) => TResult): TResult {
    return this.test.run(fn);
  }

  newOrder(init?: OrderContext.Init): OrderContext {
    return this.test.newOrder(init);
  }

  evaluate(): Promise<void> {
    return this.test.evaluate();
  }

  reset(): void {
    OrderTest$reset();
  }

}

export class OrderTest$Static extends OrderTest$StaticBase<OrderTest> implements OrderTest.Static {

  constructor() {
    super(() => OrderTest$get() || OrderTest$setup());
  }

  setup(this: void, init?: OrderTest.Init): OrderTest {
    return OrderTest$setup(init);
  }

}

function OrderTest$setup(init?: OrderTest.Init): OrderTest {
  return OrderTest$set(new OrderTest$Instance(init));
}
