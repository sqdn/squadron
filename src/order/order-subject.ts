import { Supply, SupplyPeer } from '@proc7ts/supply';
import { Formation } from '../formation';
import { Unit } from '../unit';
import { OrderTask } from './order-task';

export interface OrderSubject<TUnit extends Unit> extends SupplyPeer {

  readonly formation: Formation;

  readonly unit: TUnit;

  readonly supply: Supply;

  execute(this: void, task: OrderTask<TUnit>): void;

}
