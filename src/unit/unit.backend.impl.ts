import { valueProvider } from '@proc7ts/primitives';
import { Supply, SupplyPeer } from '@proc7ts/supply';
import { Formation } from '../formation';
import { OrderPromulgator } from '../order';
import { Unit } from './unit';
import { Unit$Host } from './unit.host.impl';

export const Unit$Backend__symbol = (/*#__PURE__*/ Symbol('Unit.backend'));

export abstract class Unit$Backend<TUnit extends Unit, THost extends Unit$Host = Unit$Host> implements SupplyPeer {

  readonly supply = new Supply();

  constructor(readonly host: THost, readonly unit: TUnit) {
  }

  abstract order(promulgator: OrderPromulgator<TUnit>): void;

  abstract deployTo(formation: Formation): void;

}

export function Unit$rejectOrder<TUnit extends Unit>(_promulgator: OrderPromulgator<TUnit>): void {
  // Reject order
}

export function Unit$doNotStart(error: unknown): () => Promise<void> {
  return valueProvider(Promise.reject(error));
}
