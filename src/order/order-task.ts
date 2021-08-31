import { Unit, UnitContext } from '../unit';

/**
 * A task executed by unit as part of its {@link OrderSubject.deploy deployment} sequence.
 *
 * The first deployment task executed for the unit with {@link UnitStatus.Instructed} status. When all deployment tasks
 * executed the unit status becomes {@link UnitStatus.Deployed}.
 *
 * @typeParam TUnit - A type of unit to execute the task for.
 * @param context - Target unit's operations context.
 *
 * @returns Either none when the task executed synchronously, or a promise-like instance resolved when the task
 * execution completes asynchronously.
 */
export type OrderTask<TUnit extends Unit> =
    (this: void, context: UnitContext<TUnit>) => void | PromiseLike<unknown>;
