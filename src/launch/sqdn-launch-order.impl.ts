import { CxEntry, CxRequest } from '@proc7ts/context-values';
import Order from '@sqdn/order';

export class SqdnLaunchOrder implements Order {

  constructor(readonly $: () => Order) {
  }

  get active(): boolean {
    return this.$().active;
  }

  get entry(): CxEntry<Order> {
    return this.$().entry;
  }

  get orderId(): string {
    return this.$().orderId;
  }

  get<TValue>(entry: CxEntry<TValue, unknown>, request?: CxRequest<TValue>): TValue | null {
    return this.$().get(entry, request);
  }

}
