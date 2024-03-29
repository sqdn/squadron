import { CxPeer } from '@proc7ts/context-builder';
import { CxEntry, cxSingle, CxValues } from '@proc7ts/context-values';
import { Supply, SupplyPeer } from '@proc7ts/supply';
import { OrderContext$storage } from './order-context.impl';

/**
 * Order execution context.
 *
 * Grants access to order's IoC context.
 *
 * Context instance is
 * [async-local](https://nodejs.org/dist/latest-v16.x/docs/api/async_context.html#class-asynclocalstorage),
 * so any asynchronous operation initiated within the same order may access its context via
 * {@link OrderContext.Entry.current OrderContext.current()} call.
 *
 * Exactly one context exists per order.
 *
 * New order can be constructed by calling {@link FormationContext.newOrder} method.
 */
export interface OrderContext extends CxValues, SupplyPeer {
  /**
   * Unique order identifier. Either {@link OrderContext.Init.orderId explicitly provided}, or generated automatically.
   */
  readonly orderId: string;

  /**
   * Order supply.
   *
   * The order is revoked once supply cut off.
   */
  readonly supply: Supply;

  /**
   * Runs the given function in this order context.
   *
   * A {@link OrderContext.Entry.current OrderContext.current()} method call would return this context instance within
   * the function, as well as within any asynchronous operation initiated within it.
   *
   * @typeParam TResult - Type of function result.
   * @param fn - A function to execute.
   *
   * @returns The value returned from function call.
   */
  run<TResult>(fn: (this: void, context: OrderContext) => TResult): TResult;
}

export namespace OrderContext {
  /**
   * Order context initialization options.
   *
   * Passed to {@link FormationContext.newOrder} to create new order.
   */
  export interface Init {
    /**
     * New order identifier.
     *
     * Will be generated automatically when omitted.
     */
    readonly orderId?: string | undefined;

    /**
     * Additional IoC context peer or peers, the values from which will be available in new context.
     */
    readonly peer?: CxPeer<OrderContext> | readonly CxPeer<OrderContext>[] | undefined;
  }

  /**
   * Context entry that serves as a unique key of {@link OrderContext} value.
   */
  export interface Entry extends CxEntry<OrderContext> {
    /**
     * Obtains current order context instance.
     *
     * @returns An instance the {@link OrderContext.run} method has been called for.
     *
     * @throws ReferenceError when called outside order execution.
     */
    current(): OrderContext;
  }
}

/**
 * Order, formation, or unit context entry containing the order context instance.
 */
export const OrderContext: OrderContext.Entry = {
  perContext: /*#__PURE__*/ cxSingle(),
  current() {
    const current = OrderContext$storage.getStore();

    if (!current) {
      throw new ReferenceError('Order unavailable outside context');
    }

    return current;
  },
  toString: () => '[OrderContext]',
};
