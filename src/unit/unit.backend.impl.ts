import { Supply, SupplyPeer } from '@proc7ts/supply';
import { Formation } from '../formation';
import { OrderInstruction } from '../order';
import { Unit } from './unit';
import { Unit$Host } from './unit.host.impl';

export const Unit$Backend__symbol = /*#__PURE__*/ Symbol('Unit.backend');

export abstract class Unit$Backend<TUnit extends Unit, THost extends Unit$Host = Unit$Host>
  implements SupplyPeer {

  readonly #supply = new Supply();

  constructor(readonly host: THost, readonly unit: TUnit) {
    this.#supply.needs(unit.createdIn);
  }

  get supply(): Supply {
    return this.#supply;
  }

  abstract instruct(instruction: OrderInstruction<TUnit>): void;

  abstract deployTo(formation: Formation): void;

}

export function Unit$rejectOrder<TUnit extends Unit>(_instruction: OrderInstruction<TUnit>): void {
  // Reject order
}
