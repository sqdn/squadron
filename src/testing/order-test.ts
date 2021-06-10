import { ContextRegistry, ContextValueProvider } from '@proc7ts/context-values';
import { silentLogger } from '@proc7ts/logger';
import { valueRecipe } from '@proc7ts/primitives';
import Order from '@sqdn/order';
import MockOrder from '@sqdn/order/mock';
import { UnitLogger } from '../common';
import { Formation } from '../formation';
import { Order$Executor } from '../impl';

export interface OrderTest {

  readonly registry: ContextRegistry<MockOrder>;

  readonly order: MockOrder;

  readonly formation: Formation;

  executeOrder(this: void): Promise<void>;

  reset(this: void): void;

}

export namespace OrderTest {

  export interface Init {

    readonly orderId?: string;

    readonly formation?: Formation | ContextValueProvider<Formation, MockOrder>;

    readonly logger?: UnitLogger | ContextValueProvider<UnitLogger, MockOrder>;

  }

  export interface Static extends OrderTest {

    setup(this: void, init?: OrderTest.Init): OrderTest;

  }

}

let OrderTest$instance: OrderTest | undefined;

export const OrderTest: OrderTest.Static = {

  setup(this: void, init: OrderTest.Init = {}): OrderTest {

    const {
      orderId,
      formation = new Formation({ tag: 'test' }),
      logger = silentLogger,
    } = init;
    const registry = new ContextRegistry<MockOrder>();

    registry.provide({ a: Order, is: MockOrder });
    registry.provide({ a: Formation, by: valueRecipe(formation) });
    registry.provide({ a: UnitLogger, by: valueRecipe(logger) });

    MockOrder.mock({
      get: registry.newValues().get,
      orderId,
    });

    return OrderTest$instance = {
      registry,
      order: MockOrder,
      formation: MockOrder.get(Formation),
      executeOrder() {
        return MockOrder.get(Order$Executor).execute();
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

  get executeOrder() {
    return OrderTest$get().executeOrder;
  },

  reset(this: void): void {
    OrderTest$instance = undefined;
    MockOrder.mockReset();
  },

};

function OrderTest$get(): OrderTest {
  return OrderTest$instance || OrderTest.setup();
}
