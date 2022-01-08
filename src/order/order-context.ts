import { CxPeer } from '@proc7ts/context-builder';
import { CxEntry, cxSingle, CxValues } from '@proc7ts/context-values';
import { OrderContext$storage } from './order-context.impl';

/**
 * Order execution context.
 *
 * Grants access to order's IoC context.
 *
 * Context instance is
 * [async-local](https://nodejs.org/dist/latest-v16.x/docs/api/async_context.html#class-asynclocalstorage),
 * so any asynchronous operation initiated within the same order may access its context via
 * {@link OrderContext.Static.current OrderContext.current()} call.
 *
 * Exactly one context exists per order.
 *
 * New order can be constructed by calling {@link FormationContext.newOrder} method.
 */
export interface OrderContext extends CxValues {

  /**
   * Unique order identifier. Either {@link OrderContext.Init.orderId explicitly provided}, or generated automatically.
   */
  readonly orderId: string;

  /**
   * Runs the given function in this order context.
   *
   * A {@link OrderContext.Static.current OrderContext.current()} method call would return this context instance within
   * the function, as well as within any asynchronous operation initiated within it.
   *
   * @typeParam TResult - Type of function result.
   * @param fn - A function to execute.
   *
   * @returns The value returned from function call.
   */
  runInContext<TResult>(fn: (this: void, context: OrderContext) => TResult): TResult;

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

  export interface Static extends CxEntry<OrderContext> {
    current(): OrderContext;
  }

}

export const OrderContext: OrderContext.Static = {
  perContext: (/*#__PURE__*/ cxSingle()),
  current() {

    const current = OrderContext$storage.getStore();

    if (!current) {
      throw new ReferenceError('Order is unavailable outside context');
    }

    return current;
  },
  toString: () => '[OrderContext]',
};
