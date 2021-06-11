import { Unit } from '../unit';
import { OrderPromulgation } from './order-promulgation';

export type OrderPromulgator<TUnit extends Unit> =
    <T extends TUnit>(this: void, promulgator: OrderPromulgation<T>) => void | PromiseLike<unknown>;
