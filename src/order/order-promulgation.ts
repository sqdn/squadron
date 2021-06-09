import { Formation } from '../formation';
import { Unit } from '../unit';

export interface OrderPromulgation<TUnit extends Unit> {

  readonly formation: Formation;

  readonly unit: TUnit;

}
