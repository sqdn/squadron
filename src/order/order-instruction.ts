import { Unit } from '../unit';
import { OrderSubject } from './order-subject';

/**
 * Instruction {@link Unit.instruct recorded} by unit to be applied when unit deployed to formation.
 *
 * @typeParam TUnit - Type of deployed unit.
 * @param subject - A subject of order the instruction is applied to.
 *
 * @returns Either none when instruction applied synchronously, or a promise-like instance resolved when the instruction
 * applied asynchronously.
 */
export type OrderInstruction<TUnit extends Unit = Unit> =
    <T extends TUnit>(this: void, subject: OrderSubject<T>) => void | PromiseLike<unknown>;
