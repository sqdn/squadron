import { CxAccessor, CxEntry } from '@proc7ts/context-values';
import Order from '@sqdn/order';

export class Formation$Order implements Order {

  readonly #orderId: string;

  constructor(orderId: string, readonly get: CxAccessor) {
    this.#orderId = orderId;
  }

  get entry(): CxEntry<Order> {
    return Order.entry;
  }

  get current(): Order {
    return Order.current;
  }

  get active(): true {
    return true;
  }

  get orderId(): string {
    return this.#orderId;
  }

  get [Symbol.toStringTag](): string {
    return this.orderId;
  }

  toString(): string {
    return `[Order ${this[Symbol.toStringTag]}]`;
  }

}
