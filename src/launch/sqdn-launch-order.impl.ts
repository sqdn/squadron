import { CxEntry, CxRequest } from '@proc7ts/context-values';
import Order from '@sqdn/order';

export class SqdnLaunchOrder implements Order {

  readonly #getOrder: () => Order;

  constructor(getOrder: () => Order) {
    this.#getOrder = getOrder;
  }

  get active(): boolean {
    return this.#getOrder().active;
  }

  get entry(): CxEntry<Order> {
    return this.#getOrder().entry;
  }

  get orderId(): string {
    return this.#getOrder().orderId;
  }

  get<TValue>(entry: CxEntry<TValue, unknown>, request?: CxRequest<TValue>): TValue | null {
    return this.#getOrder().get(entry, request);
  }

}
