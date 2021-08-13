import { cxBuildAsset, CxBuilder, cxConstAsset } from '@proc7ts/context-builder';
import { Logger, silentLogger } from '@proc7ts/logger';
import { lazyValue } from '@proc7ts/primitives';
import Order from '@sqdn/order';
import MockOrder from '@sqdn/order/mock';
import { Formation, FormationContext } from '../formation';
import { Formation$Context } from '../formation/formation.context.impl';
import { Formation$Host, Order$Evaluator } from '../impl';

export interface OrderTest {

  readonly cxBuilder: CxBuilder<Order>;

  readonly order: MockOrder;

  readonly formation: Formation;

  readonly formationCxBuilder: CxBuilder<FormationContext>;

  evaluate(this: void): Promise<void>;

  reset(this: void): void;

}

export namespace OrderTest {

  export interface Init {

    readonly orderId?: string;

    readonly logger?: Logger;

    getFormation?(this: void): Formation;

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
      getFormation = lazyValue(() => new Formation({ tag: 'test' })),
      logger = silentLogger,
    } = init;

    const host = new Formation$Host({
      getFormation,
      createContext: (host, get, builder) => new Formation$Context(
          host,
          get,
          builder,
      ),
    });
    const cxBuilder = host.newOrderBuilder(orderId || 'mock-order');
    let order: MockOrder;

    cxBuilder.provide(cxBuildAsset(Order.entry, () => order));
    host.cxBuilder.provide(cxConstAsset(Logger, logger));

    const orderContext = cxBuilder.context;

    order = MockOrder.mock({
      orderId: orderContext.orderId,
      peer: cxBuilder,
    });

    return OrderTest$instance = {
      cxBuilder,
      order,
      formation: order.get(Formation),
      formationCxBuilder: host.cxBuilder,

      evaluate(): Promise<void> {
        if (order.active) {
          return order
              .get(Order$Evaluator)
              .executeOrder()
              .then(() => {
                order = MockOrder.mockReset();
              });
        }

        return host.workbench.evaluate();
      },

      reset: OrderTest.reset,
    };
  },

  get cxBuilder(): CxBuilder<Order> {
    return OrderTest$get().cxBuilder;
  },

  get order(): MockOrder {
    return OrderTest$get().order;
  },

  get formation(): Formation {
    return OrderTest$get().formation;
  },

  get formationCxBuilder(): CxBuilder<FormationContext> {
    return OrderTest$get().formationCxBuilder;
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
