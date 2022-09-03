import { Logger } from '@proc7ts/logger';
import { Supply } from '@proc7ts/supply';
import { Unit } from '../unit';
import { OrderTest } from './order-test';

export interface FormationTest extends OrderTest {
  init(): this;

  deploy<TUnit extends Unit>(unit: TUnit): TUnit;
}

export namespace FormationTest {
  export interface Init {
    readonly orderId?: string | undefined;

    readonly logger?: Logger | undefined;

    readonly supply?: Supply | undefined;
  }
}
