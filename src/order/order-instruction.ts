import { Unit } from '../unit';
import { OrderSubject } from './order-subject';

export type OrderInstruction<TUnit extends Unit> =
    <T extends TUnit>(this: void, subject: OrderSubject<T>) => void | PromiseLike<unknown>;
