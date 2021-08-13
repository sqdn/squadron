import { CxEntry, cxScoped, cxSingle } from '@proc7ts/context-values';
import Order from '@sqdn/order';
import { Order$Evaluator } from '../impl';
import { Unit } from './unit';

export interface OrderUnits {

  unitByUid<TUnit extends Unit>(uid: string, unitType: new (init?: Unit.Init) => TUnit): TUnit;

}

export const OrderUnits: CxEntry<OrderUnits> = {
  perContext: (/*#__PURE__*/ cxScoped(
      Order.entry,
      (/*#__PURE__*/ cxSingle({
        byDefault: target => new Order$Units(target.get(Order$Evaluator)),
      })),
  )),
  toString: () => '[OrderUnits]',
};

class Order$Units implements OrderUnits {

  readonly #evaluator: Order$Evaluator;

  constructor(evaluator: Order$Evaluator) {
    this.#evaluator = evaluator;
  }

  unitByUid<TUnit extends Unit>(uid: string, unitType: new (init?: Unit.Init) => TUnit): TUnit {
    return this.#evaluator.unitByUid(uid, unitType);
  }

}
