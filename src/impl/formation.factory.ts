import { CxBuilder } from '@proc7ts/context-builder';
import { CxAccessor } from '@proc7ts/context-values';
import Order from '@sqdn/order';
import { FormationContext } from '../formation';
import { UnitOrigin } from '../unit';
import { Formation$Host } from './formation.host';

export interface Formation$Factory {

  readonly orderId: string;

  createOrigin(this: void, order: Order, orderBuilder: CxBuilder<Order>): UnitOrigin;

  createContext: (
      this: void,
      host: Formation$Host,
      get: CxAccessor,
      builder: CxBuilder<FormationContext>,
  ) => FormationContext;

  createOrder?: ((this: void, get: CxAccessor, cxBuilder: CxBuilder<Order>) => Order) | undefined;

}
