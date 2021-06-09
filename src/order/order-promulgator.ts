import { Unit } from '../unit';
import { OrderPromulgation } from './order-promulgation';

export type OrderPromulgator<TUnit extends Unit> =
    (this: void, record: OrderPromulgation<TUnit>) => void | PromiseLike<unknown>;
