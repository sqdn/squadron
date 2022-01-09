import { CxAccessor, CxEntry, CxRequest } from '@proc7ts/context-values';
import { Supply } from '@proc7ts/supply';
import { AsyncLocalStorage } from 'node:async_hooks';
import { OrderContext } from './order-context';

export const OrderContext$storage = new AsyncLocalStorage<OrderContext>();

export class OrderContext$ implements OrderContext {

  readonly #supply = new Supply();
  readonly #orderId: string;
  readonly #get: CxAccessor;

  constructor(orderId: string, get: CxAccessor) {
    this.#orderId = orderId;
    this.#get = get;
  }

  get orderId(): string {
    return this.#orderId;
  }

  get supply(): Supply {
    return this.#supply;
  }

  get<TValue>(entry: CxEntry<TValue, unknown>, request?: CxRequest<TValue>): TValue | null {
    return this.#get(entry, request);
  }

  run<TResult>(fn: (this: void, context: OrderContext) => TResult): TResult {
    return OrderContext$storage.run(this, fn, this);
  }

  get [Symbol.toStringTag](): string {
    return 'OrderContext';
  }

  toString(): string {
    return `[${this[Symbol.toStringTag]} ${this.orderId}]`;
  }

}
