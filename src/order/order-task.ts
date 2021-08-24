import { Unit, UnitContext } from '../unit';

/**
 * A task {@link OrderSubject.execute executed} by unit as part of its startup sequence.
 *
 * The first task executed for the unit with {@link UnitStatus.Instructed} status. When all tasks executed the unit
 * status becomes {@link UnitStatus.Executed}.
 *
 * @typeParam TUnit - Type of unit to execute.
 * @param context - Executed unit context.
 *
 * @returns Either none when the task executed synchronously, or a promise-like instance resolved when the task
 * execution completes asynchronously.
 */
export type OrderTask<TUnit extends Unit> =
    (this: void, context: UnitContext<TUnit>) => void | PromiseLike<unknown>;
