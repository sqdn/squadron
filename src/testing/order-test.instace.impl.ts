import { CxBuilder, cxConstAsset } from '@proc7ts/context-builder';
import { Logger, silentLogger } from '@proc7ts/logger';
import { Supply } from '@proc7ts/supply';
import Order from '@sqdn/order';
import MockOrder from '@sqdn/order/mock';
import { Formation, FormationContext } from '../formation';
import { Formation$Context } from '../formation/formation.context.impl';
import { Hub } from '../hub';
import { Formation$Host, Order$Evaluator } from '../impl';
import { OrderTest } from './order-test';

export class OrderTest$Instance implements OrderTest {

  readonly #host: Formation$Host;
  #order!: MockOrder;
  readonly #supply: Supply;

  constructor(init: OrderTest.Init = {}) {

    const {
      orderId = 'mock-order',
      createOrigin = order => ({
        hub: OrderTest$defaultHub(order),
        formation: OrderTest$defaultFormation(order),
      }),
      supply = new Supply(),
      logger = silentLogger,
    } = init;

    this.#supply = supply;
    this.#host = new Formation$Host({
      orderId,
      createOrigin,
      createContext(host, get, builder) {
        builder.provide(cxConstAsset(Logger, logger));
        return new Formation$Context(host, get, builder);
      },
      createOrder: (_get, orderBuilder) => this.#order = MockOrder.mock({
        orderId,
        peer: orderBuilder,
      }),
    });
  }

  initOrder(): this {
    void this.#host.order; // Ensure order is mocked
    return this;
  }

  get hub(): Hub {
    return this.#host.hub;
  }

  get formation(): Formation {
    return this.#host.formation;
  }

  get formationBuilder(): CxBuilder<FormationContext> {
    return this.#host.formationBuilder;
  }

  get order(): MockOrder {
    return this.#order;
  }

  get orderBuilder(): CxBuilder<Order> {
    return this.#host.orderBuilder;
  }

  get supply(): Supply {
    return this.#supply;
  }

  evaluate(reset = true): Promise<void> {
    if (this.order.active) {
      return this.order
          .get(Order$Evaluator)
          .executeOrder()
          .then(() => {
            if (reset) {
              this.#order = MockOrder.mockReset();
            }
          });
    }

    return this.#host.workbench.evaluate();
  }

}

let OrderTest$instance: OrderTest$Instance | undefined;

export function OrderTest$get(): OrderTest$Instance | undefined {
  return OrderTest$instance;
}

export function OrderTest$set<TTest extends OrderTest$Instance>(this: void, test: TTest): TTest {
  return (OrderTest$instance = test).initOrder();
}

export function OrderTest$reset(): void {

  const test = OrderTest$instance;

  if (test) {
    OrderTest$instance = undefined;
    test.supply.off();
  }

  MockOrder.mockReset();
}

export function OrderTest$defaultHub(order: Order): Hub {
  return new Hub({ tag: 'test', order });
}

export function OrderTest$defaultFormation(order: Order): Formation {
  return new Formation({ tag: 'test', order });
}
