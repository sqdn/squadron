import { CxBuilder, cxConstAsset } from '@proc7ts/context-builder';
import { Logger, silentLogger } from '@proc7ts/logger';
import { Supply } from '@proc7ts/supply';
import { Formation, FormationContext } from '../formation';
import { Formation$Context } from '../formation/formation.context.impl';
import { Hub } from '../hub';
import { Formation$Host } from '../impl';
import { OrderContext } from '../order';
import { OrderTest } from './order-test';

export class OrderTest$Instance implements OrderTest {

  readonly #host: Formation$Host;
  readonly #supply: Supply;

  constructor(init: OrderTest.Init = {}) {
    const {
      orderId = 'mock-order',
      createOrigin = createdIn => ({
        hub: OrderTest$defaultHub(createdIn),
        formation: OrderTest$defaultFormation(createdIn),
      }),
      supply = new Supply(),
      logger = silentLogger,
    } = init;

    this.#supply = supply;
    this.#host = new Formation$Host({
      orderId,
      createOrigin: createOrigin,
      createContext(host, get, builder) {
        builder.provide(cxConstAsset(Logger, logger));

        return new Formation$Context(host, get, builder);
      },
    });
  }

  initOrder(): this {
    void this.#host.createdIn; // Ensure order is mocked

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

  get createdIn(): OrderContext {
    return this.#host.createdIn;
  }

  get builtBy(): CxBuilder<OrderContext> {
    return this.#host.builtBy;
  }

  get supply(): Supply {
    return this.#supply;
  }

  run<TResult>(fn: (this: void, context: OrderContext) => TResult): TResult {
    return this.formation.createdIn.run(fn);
  }

  newOrder(init?: OrderContext.Init): OrderContext {
    return this.#host.formationBuilder.context.newOrder(init);
  }

  evaluate(): Promise<void> {
    return this.#host.executeOrder();
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
}

export function OrderTest$defaultHub(createdIn: OrderContext): Hub {
  return new Hub({ tag: 'test', createdIn });
}

export function OrderTest$defaultFormation(createdIn: OrderContext): Formation {
  return new Formation({ tag: 'test', createdIn });
}
