import { Supply } from '@proc7ts/supply';
import { Formation } from '../formation';
import { Unit, UnitTask } from '../unit';

export interface OrderPromulgation<TUnit extends Unit> {

  readonly formation: Formation;

  readonly unit: TUnit;

  readonly supply: Supply;

  execute(task: UnitTask<TUnit>): void;

}
