import { lazyValue } from '@proc7ts/primitives';
import { Supply, SupplyPeer } from '@proc7ts/supply';
import Order from '@sqdn/order';
import { createHash } from 'crypto';
import { Order$Executor, Unit$Executor, Unit$Executor__symbol } from '../impl';
import { OrderPromulgator } from '../order';

const Unit$Id__symbol = (/*#__PURE__*/ Symbol('Unit.id'));

export abstract class Unit implements SupplyPeer {

  /**
   * @internal
   */
  private readonly [Unit$Id__symbol]: Unit$Id;

  /**
   * @internal
   */
  private readonly [Unit$Executor__symbol]: () => Unit$Executor<this>;

  constructor(init?: Unit.Init) {
    Error.captureStackTrace(
        this[Unit$Id__symbol] = new Unit$Id(this, init),
        new.target,
    );
    this[Unit$Executor__symbol] = lazyValue(() => Order.get(Order$Executor).unit(this));
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
    return this[Unit$Executor__symbol]().supply;
  }

  get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  order(promulgator: OrderPromulgator<this>): this {
    this[Unit$Executor__symbol]().order(promulgator);
    return this;
  }

  off(): this {
    this[Unit$Executor__symbol]().supply.off();
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

class Unit$Id {

  stack!: string;
  readonly tag: string;
  private _origin?: string;
  private _uid?: string;

  constructor(readonly unit: Unit, { tag = '' }: Unit.Init = {}) {
    this.tag = tag;
  }

  get name(): string {
    return 'Unit';
  }

  get message(): string {
    return this.unit.constructor.name;
  }

  get origin(): string {
    if (!this._origin) {

      const origin = Unit$origin(this.stack);
      const tag = this.tag;

      this._origin = tag ? `${origin}:${tag}` : origin;
    }

    return this._origin;
  }

  get uid(): string {
    if (!this._uid) {

      const hash = createHash('sha256');

      hash.update(this.stack);

      const stackHash = hash.digest('hex');

      this._uid = this.tag ? `${this.tag}@${stackHash}` : stackHash;
    }

    return this._uid;
  }

}

const Unit$stack$nlPattern = /\n/;
const Unit$stack$originPattern = /\((.+)\)/;

function Unit$origin(stack: string): string {

  const line = stack.split(Unit$stack$nlPattern, 2)[1];

  return Unit$stack$originPattern.exec(line)![1];
}
