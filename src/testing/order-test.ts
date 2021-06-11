import { ContextRegistry, ContextValueProvider } from '@proc7ts/context-values';
import { silentLogger } from '@proc7ts/logger';
import { noop, valueRecipe } from '@proc7ts/primitives';
import Order from '@sqdn/order';
import MockOrder from '@sqdn/order/mock';
import { UnitLogger } from '../common';
import { Formation, FormationContext } from '../formation';
import { Formation$Host, Order$Evaluator } from '../impl';
import { Unit, UnitTask } from '../unit';

export interface OrderTest {

  readonly registry: ContextRegistry<MockOrder>;

  readonly order: MockOrder;

  readonly formation: Formation;

  readonly formationRegistry: ContextRegistry<FormationContext>;

  evaluate(this: void): Promise<void>;

  reset(this: void): void;

}

export namespace OrderTest {

  export interface Init {

    readonly orderId?: string;

    readonly logger?: UnitLogger | ContextValueProvider<UnitLogger>;

    formation?(this: void, order: Order): Formation;

  }

  export interface Static extends OrderTest {

    setup(this: void, init?: OrderTest.Init): OrderTest;

  }

  export type UnitsStarter = <TUnit extends Unit>(
      this: void,
      unit: TUnit,
      starter: UnitTask<TUnit>,
  ) => void | PromiseLike<unknown>;

}

let OrderTest$instance: OrderTest | undefined;

export const OrderTest: OrderTest.Static = {

  setup(this: void, init: OrderTest.Init = {}): OrderTest {

    const {
      orderId,
      formation = () => new Formation({ tag: 'test' }),
      logger = silentLogger,
    } = init;

    const host = new Formation$Host(formation);
    const { registry, order } = host.newOrder(orderId || 'mock-order');

    registry.provide({ a: Order, is: MockOrder });
    host.registry.provide({ a: UnitLogger, by: valueRecipe(logger) });

    MockOrder.mock({
      ...order,
      orderId,
    });

    return OrderTest$instance = {
      registry,
      order: MockOrder,
      formation: MockOrder.get(Formation),
      formationRegistry: host.registry,
      evaluate(): Promise<void> {
        if (MockOrder.active) {
          return MockOrder
              .get(Order$Evaluator)
              .executeOrder()
              .then(() => {
                MockOrder.mockReset();
              });
        }

        return host.workbench
            .workbench
            .work(host.workbench.executionStage)
            .run(noop);
      },
      reset: OrderTest.reset,
    };
  },

  get registry(): ContextRegistry<MockOrder> {
    return OrderTest$get().registry;
  },

  get order(): MockOrder {
    return OrderTest$get().order;
  },

  get formation(): Formation {
    return OrderTest$get().formation;
  },

  get formationRegistry(): ContextRegistry<FormationContext> {
    return OrderTest$get().formationRegistry;
  },

  get evaluate() {
    return OrderTest$get().evaluate;
  },

  reset(this: void): void {
    OrderTest$instance = undefined;
    MockOrder.mockReset();
  },

};

function OrderTest$get(): OrderTest {
  return OrderTest$instance || OrderTest.setup();
}
