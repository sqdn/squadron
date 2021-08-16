import { CxBuilder } from '@proc7ts/context-builder';
import { Logger } from '@proc7ts/logger';
import { Supply } from '@proc7ts/supply';
import Order from '@sqdn/order';
import MockOrder from '@sqdn/order/mock';
import { Formation, FormationContext } from '../formation';
import { Hub } from '../hub';
import { UnitOrigin } from '../unit';
import { OrderTest$Static } from './order-test.static.impl';

export interface OrderTest {

  readonly hub: Hub;

  readonly formation: Formation;

  readonly formationBuilder: CxBuilder<FormationContext>;

  readonly order: MockOrder;

  readonly orderBuilder: CxBuilder<Order>;

  readonly supply: Supply;

  evaluate(reset?: boolean): Promise<void>;

}

export namespace OrderTest {

  export interface Init {

    readonly orderId?: string | undefined;

    readonly logger?: Logger | undefined;

    readonly supply?: Supply | undefined;

    createOrigin?: ((this: void, order: Order, orderBuilder: CxBuilder<Order>) => UnitOrigin) | undefined;

  }

  export interface Static extends OrderTest {

    setup(init?: OrderTest.Init): OrderTest;

    reset(): void;

  }

}

export const OrderTest: OrderTest.Static = (/*#__PURE__*/ new OrderTest$Static());
