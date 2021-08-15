import { CxBuilder, cxConstAsset } from '@proc7ts/context-builder';
import { Logger, silentLogger } from '@proc7ts/logger';
import Order from '@sqdn/order';
import MockOrder from '@sqdn/order/mock';
import { Formation, FormationContext } from '../formation';
import { Formation$Context } from '../formation/formation.context.impl';
import { Hub } from '../hub';
import { Formation$Host, Order$Evaluator } from '../impl';
import { UnitOrigin } from '../unit';

export interface OrderTest {

  readonly orderBuilder: CxBuilder<Order>;

  readonly order: MockOrder;

  readonly hub: Hub;

  readonly formation: Formation;

  readonly formationBuilder: CxBuilder<FormationContext>;

  evaluate(this: void): Promise<void>;

  reset(this: void): void;

}

export namespace OrderTest {

  export interface Init {

    readonly orderId?: string;

    readonly logger?: Logger;

    createOrigin?: ((this: void, order: Order, orderBuilder: CxBuilder<Order>) => UnitOrigin) | undefined;

  }

  export interface Static extends OrderTest {

    setup(this: void, init?: OrderTest.Init): OrderTest;

  }

}

let OrderTest$instance: OrderTest | undefined;

export const OrderTest: OrderTest.Static = {

  setup(this: void, init: OrderTest.Init = {}): OrderTest {

    const {
      orderId = 'mock-order',
      createOrigin = order => ({
        hub: new Hub({ tag: 'test', order }),
        formation: new Formation({ tag: 'test', order }),
      }),
      logger = silentLogger,
    } = init;

    let order!: MockOrder;

    const host = new Formation$Host({
      orderId,
      createOrigin,
      createContext(host, get, builder) {
        builder.provide(cxConstAsset(Logger, logger));
        return new Formation$Context(host, get, builder);
      },
      createOrder(_get, orderBuilder) {
        return order = MockOrder.mock({
          orderId,
          peer: orderBuilder,
        });
      },
    });

    const { orderBuilder, hub, formation, formationBuilder } = host;

    return OrderTest$instance = {
      orderBuilder,
      order,
      hub,
      formation,
      formationBuilder,

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

  get orderBuilder(): CxBuilder<Order> {
    return OrderTest$get().orderBuilder;
  },

  get order(): MockOrder {
    return OrderTest$get().order;
  },

  get hub(): Hub {
    return OrderTest$get().hub;
  },

  get formation(): Formation {
    return OrderTest$get().formation;
  },

  get formationBuilder(): CxBuilder<FormationContext> {
    return OrderTest$get().formationBuilder;
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
