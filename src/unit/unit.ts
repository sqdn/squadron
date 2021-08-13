import { Supply, SupplyPeer } from '@proc7ts/supply';
import Order from '@sqdn/order';
import { Order$Evaluator } from '../impl';
import { OrderInstruction } from '../order';
import { Unit$Backend, Unit$Backend__symbol } from './unit.backend.impl';
import { Unit$Id, Unit$Id__symbol } from './unit.id.impl';

/**
 * Executive unit representation.
 *
 * Unit instances supposed to be constructed within orders.
 *
 * Unit's {@link uid unique identifier} is a hash of its stack trace. So, the identifier would stay the same on each
 * order evaluation. It is also possible to specify a {@link Unit.Init.tag tag} to add to identifier to make a
 * distinction between units created at the same location, e.g. within loops.
 */
export class Unit implements SupplyPeer {

  readonly #order: Order;

  /**
   * @internal
   */
  [Unit$Id__symbol]: Unit$Id;

  /**
   * @internal
   */
  [Unit$Backend__symbol]: Unit$Backend<this>;

  /**
   * Constructs executive unit representation.
   *
   * @param init - Unit initialization options.
   */
  constructor(init: Unit.Init = {}) {

    const { order = Order.current } = init;

    this.#order = order;
    Error.captureStackTrace(
        this[Unit$Id__symbol] = new Unit$Id(this, init),
        new.target,
    );

    this[Unit$Backend__symbol] = this.order.get(Order$Evaluator).evalUnit(this);
  }

  /**
   * Unit origin.
   *
   * Contains a location within the order the unit were created at.
   */
  get origin(): string {
    return this[Unit$Id__symbol].origin;
  }

  /**
   * The order this unit originated from.
   *
   * This is the order the unit constructor has been called in.
   */
  get order(): Order {
    return this.#order;
  }

  /**
   * Unique identifier of this unit.
   *
   * Unit instances with the same identifier represent the same executive unit.
   */
  get uid(): string {
    return this[Unit$Id__symbol].uid;
  }

  /**
   * Unit supply.
   *
   * The unit is withdrawn once this supply cut off.
   */
  get supply(): Supply {
    return this[Unit$Backend__symbol].supply;
  }

  get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  /**
   * Records an instruction for this unit to execute later.
   *
   * The recorded instruction will be first accepted and then executed within the formation(s) this unit
   * {@link Formation.deploy deployed} to.
   *
   * @param instruction - An instruction to record.
   *
   * @returns `this` instance.
   */
  instruct(instruction: OrderInstruction<this>): this {
    this[Unit$Backend__symbol].instruct(instruction);
    return this;
  }

  /**
   * Withdraws the unit.
   */
  off(): this {
    this[Unit$Backend__symbol].supply.off();
    return this;
  }

  toString(): string {

    const { uid } = this[Unit$Id__symbol];

    return `[${this[Symbol.toStringTag]}...${uid.slice(-7)}(${this.origin})]`;
  }

}

export namespace Unit {

  /**
   * Executive order initialization options.
   */
  export interface Init {

    /**
     * The order the unit created in.
     *
     * Defaults to current order.
     */
    readonly order?: Order | undefined;

    /**
     * Unit tag to add to its identifier.
     *
     * Nothing will be added when missing or empty.
     */
    readonly tag?: string | undefined;

    /**
     * Explicitly specified unit identifier.
     *
     * When missing or empty, the identifier will be generated based on the stack trace of its constructor invocation.
     */
    readonly id?: string | undefined;

  }

}
