import { CxBuilder } from '@proc7ts/context-builder';
import { Logger } from '@proc7ts/logger';
import { Supply } from '@proc7ts/supply';
import { Formation } from '../formation';
import { Hub } from '../hub';
import { OrderContext } from '../order';
import { FormationTest } from './formation-test';
import { HubTest$Static } from './hub-test.static.impl';
import { OrderTest } from './order-test';

export interface HubTest extends OrderTest {
  readonly formation: Hub;

  testFormation(formation: Formation, init?: FormationTest.Init): FormationTest;
}

export namespace HubTest {
  export interface Init {
    readonly orderId?: string | undefined;

    readonly logger?: Logger | undefined;

    readonly supply?: Supply | undefined;

    createHub?:
      | ((this: void, createdIn: OrderContext, builtBy: CxBuilder<OrderContext>) => Hub)
      | undefined;
  }

  export interface Static extends HubTest {
    setup(this: void, init?: HubTest.Init): HubTest;

    reset(): void;
  }

  export type FormationSetup = (fmnTest: OrderTest) => void;
}

export const HubTest: HubTest.Static = /*#__PURE__*/ new HubTest$Static();
