import { CxBuilder, cxConstAsset } from '@proc7ts/context-builder';
import { Logger, silentLogger } from '@proc7ts/logger';
import { lazyValue, noop } from '@proc7ts/primitives';
import Order from '@sqdn/order';
import MockOrder from '@sqdn/order/mock';
import { Formation, FormationContext } from '../formation';
import { FormationContext$create } from '../formation/formation-context.impl';
import { Formation$Host, Order$Evaluator } from '../impl';
import { Unit, UnitTask } from '../unit';

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
      getFormation = lazyValue(() => new Formation({ tag: 'test' })),
      logger = silentLogger,
    } = init;

    const host = new Formation$Host({
      getFormation,
      createContext: (host, get, builder) => FormationContext$create(
          host,
          get,
          builder,
      ),
    });
    const cxBuilder = host.newOrderBuilder(orderId || 'mock-order');

    cxBuilder.provide(cxConstAsset(Order.entry, MockOrder));
    host.cxBuilder.provide(cxConstAsset(Logger, logger));

    const order = cxBuilder.context;

    MockOrder.mock({
      orderId: order.orderId,
      peer: cxBuilder,
    });

    return OrderTest$instance = {
      cxBuilder,
      order: MockOrder,
      formation: MockOrder.get(Formation),
      formationCxBuilder: host.cxBuilder,
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
