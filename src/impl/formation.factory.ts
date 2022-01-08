import { CxBuilder } from '@proc7ts/context-builder';
import { CxAccessor } from '@proc7ts/context-values';
import { FormationContext } from '../formation';
import { OrderContext } from '../order';
import { UnitOrigin } from '../unit';
import { Formation$Host } from './formation.host';

export interface Formation$Factory {

  readonly orderId: string;

  newOrigin(this: void, createdIn: OrderContext, builtBy: CxBuilder<OrderContext>): UnitOrigin;

  createContext: (
      this: void,
      host: Formation$Host,
      get: CxAccessor,
      builder: CxBuilder<FormationContext>,
  ) => FormationContext;

}
