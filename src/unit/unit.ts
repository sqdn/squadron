import { lazyValue } from '@proc7ts/primitives';
import { Supply, SupplyPeer } from '@proc7ts/supply';
import Order from '@sqdn/order';
import { Order$Evaluator } from '../impl';
import { OrderPromulgator } from '../order';
import { Unit$Backend, Unit$Backend__symbol } from './unit.backend.impl';
import { Unit$Id, Unit$Id__symbol } from './unit.id.impl';

export class Unit implements SupplyPeer {

  /**
   * @internal
   */
  [Unit$Id__symbol]: Unit$Id;

  /**
   * @internal
   */
  [Unit$Backend__symbol]: () => Unit$Backend<this>;

  constructor(init?: Unit.Init) {
    Error.captureStackTrace(
        this[Unit$Id__symbol] = new Unit$Id(this, init),
        new.target,
    );
    this[Unit$Backend__symbol] = lazyValue(() => Order.get(Order$Evaluator).evalUnit(this));
  }

  get origin(): string {
    return this[Unit$Id__symbol].origin;
  }

  get tag(): string {
    return this[Unit$Id__symbol].tag;
  }

  get uid(): string {
    return this[Unit$Id__symbol].uid;
  }

  get supply(): Supply {
    return this[Unit$Backend__symbol]().supply;
  }

  get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  order(promulgator: OrderPromulgator<this>): this {
    this[Unit$Backend__symbol]().order(promulgator);
    return this;
  }

  off(): this {
    this[Unit$Backend__symbol]().supply.off();
    return this;
  }

  toString(): string {

    const { uid } = this[Unit$Id__symbol];

    return `${this[Symbol.toStringTag]}...${uid.slice(-7)}(${this.origin})`;
  }

}

export namespace Unit {

  export interface Init {

    readonly tag?: string;

  }

}
