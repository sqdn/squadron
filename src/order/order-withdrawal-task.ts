/**
 * A task {@link OrderSubject.executeUponWithdrawal executed} upon {@link OrderSubject.withdraw withdrawal} of order
 * subject.
 *
 * @param reason - The reason of order subject withdrawal.
 *
 * @returns Either none when the task executed synchronously, or a promise-like instance resolved when the task
 * execution completes asynchronously.
 */
export type OrderWithdrawalTask = (this: void, reason: unknown) => void | PromiseLike<unknown>;
