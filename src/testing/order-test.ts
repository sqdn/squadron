import { CxBuilder } from '@proc7ts/context-builder';
import { Logger } from '@proc7ts/logger';
import { Supply } from '@proc7ts/supply';
import { Formation, FormationContext } from '../formation';
import { Hub } from '../hub';
import { OrderContext } from '../order';
import { UnitOrigin } from '../unit';
import { OrderTest$Static } from './order-test.static.impl';

export interface OrderTest {

  readonly hub: Hub;

  readonly formation: Formation;

  readonly formationBuilder: CxBuilder<FormationContext>;

  readonly createdIn: OrderContext;

  readonly builtBy: CxBuilder<OrderContext>;

  readonly supply: Supply;

  run<TResult>(fn: (this: void, context: OrderContext) => TResult): TResult;

  evaluate(): Promise<void>;

}

export namespace OrderTest {

  export interface Init {

    readonly orderId?: string | undefined;

    readonly logger?: Logger | undefined;

    readonly supply?: Supply | undefined;

    newOrigin?: ((this: void, createdIn: OrderContext, builtBy: CxBuilder<OrderContext>) => UnitOrigin) | undefined;

  }

  export interface Static extends OrderTest {

    setup(init?: OrderTest.Init): OrderTest;

    reset(): void;

  }

}

export const OrderTest: OrderTest.Static = (/*#__PURE__*/ new OrderTest$Static());
