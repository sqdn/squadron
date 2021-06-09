import { ContextRegistry } from '@proc7ts/context-values';
import { valueRecipe } from '@proc7ts/primitives';
import Order from '@sqdn/order';
import MockOrder from '@sqdn/order/mock';
import { Formation } from '../formation';
import { Order$Executor } from '../impl';

export namespace OrderTest {

  export interface Init {

    readonly orderId?: string;

    readonly formation?:
        | Formation
        | ((this: void, context: MockOrder) => Formation);

    setup?(registry: ContextRegistry<MockOrder>): void;

  }

}

export interface OrderTest {

  readonly order: MockOrder;

  readonly formation: Formation;

  executeOrder(this: void): Promise<void>;

  reset(this: void): void;

}

export const OrderTest = {

  setup(this: void, init: OrderTest.Init = {}): OrderTest {

    const { orderId, formation = new Formation({ tag: 'test' }) } = init;
    const registry = new ContextRegistry<MockOrder>();

    registry.provide({ a: Order, is: MockOrder });
    registry.provide({ a: Formation, by: valueRecipe(formation) });
    init.setup?.(registry);

    MockOrder.mock({
      get: registry.newValues().get,
      orderId,
    });

    return {
      order: MockOrder,
      formation: MockOrder.get(Formation),
      executeOrder: OrderTest.executeOrder,
      reset: OrderTest.reset,
    };
  },

  executeOrder(this: void): Promise<void> {
    return MockOrder.get(Order$Executor).execute();
  },

  reset(this: void): void {
    MockOrder.mockReset();
  },

};
