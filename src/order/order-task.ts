import { Unit, UnitContext } from '../unit';

/**
 * A task {@link OrderSubject.execute executed} by unit.
 *
 * At first, the tasks executed while the unit is in the {@link UnitStatus.Instructed} status. When all pending tasks
 * executed, the unit status becomes {@link UnitStatus.Executed}.
 *
 * @typeParam TUnit - A type of unit to execute the task for.
 * @param context - Target unit's operations context.
 *
 * @returns Either none when the task executed synchronously, or a promise-like instance resolved when the task
 * execution completes asynchronously.
 */
export type OrderTask<TUnit extends Unit> = (
  this: void,
  context: UnitContext<TUnit>,
) => void | PromiseLike<unknown>;
