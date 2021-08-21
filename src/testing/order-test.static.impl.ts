import { CxBuilder } from '@proc7ts/context-builder';
import { Supply } from '@proc7ts/supply';
import Order from '@sqdn/order';
import MockOrder from '@sqdn/order/mock';
import { Formation, FormationContext } from '../formation';
import { Hub } from '../hub';
import { OrderTest } from './order-test';
import { OrderTest$get, OrderTest$Instance, OrderTest$reset, OrderTest$set } from './order-test.instace.impl';

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

  get order(): MockOrder {
    return this.test.order;
  }

  get orderBuilder(): CxBuilder<Order> {
    return this.test.orderBuilder;
  }

  get supply(): Supply {
    return this.test.supply;
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
