import { Supply, SupplyPeer } from '@proc7ts/supply';
import { Formation } from '../formation';
import { Formation$Host, Order$Evaluator } from '../impl';
import { DueSqdnLog, SqdnLoggable } from '../logging';
import { OrderContext, OrderInstruction } from '../order';
import { Unit$Backend, Unit$Backend__symbol } from './unit.backend.impl';
import { Unit$Id, Unit$Id__symbol } from './unit.id.impl';

/**
 * Executive unit representation.
 *
 * Unit's {@link uid unique identifier} is a hash of its stack trace. So, the identifier would stay the same on each
 * order evaluation. It is also possible to specify a {@link Unit.Init.tag tag} to add to identifier to make a
 * distinction between units created at the same line of source code, e.g. within loops.
 *
 * Unit can be instantiated only {@link OrderContext.Entry.current within order}.
 */
export class Unit implements SqdnLoggable, SupplyPeer {

  /**
   * The name of the unit instance of this type.
   *
   * Displayed in unit's string representation.
   */
  static get unitName(): string {
    return this.name;
  }

  readonly #createdIn: OrderContext;

  /**
   * @internal
   */
  [Unit$Id__symbol]: Unit$Id;

  #backend: Unit$Backend<this> | undefined;

  /**
   * Constructs executive unit representation.
   *
   * @param init - Unit initialization options.
   */
  constructor(init: Unit.Init = {}) {

    const { createdIn = OrderContext.current() } = init;

    this.#createdIn = createdIn;
    Error.captureStackTrace(
        this[Unit$Id__symbol] = new Unit$Id(this, init),
        new.target,
    );
    this.createdIn.get(Formation$Host).addUnit(this);
  }

  /**
   * Represents this unit as {@link Formation}, if possible.
   *
   * This is the unit itself if it is a formation, or `undefined` otherwise.
   */
  get asFormation(): Formation | undefined {
    return;
  }

  /**
   * @internal
   */
  get [Unit$Backend__symbol](): Unit$Backend<this> {
    return this.#backend ||= this.createdIn.get(Order$Evaluator).evalUnit(this);
  }

  /**
   * @internal
   */
  set [Unit$Backend__symbol](value: Unit$Backend<this>) {
    this.#backend = value;
  }

  /**
   * A link to fragment of source code that created this unit.
   *
   * Has a format inherent from stack trace: `${file}:${line}:${column}`.
   */
  get sourceLink(): string {
    return this[Unit$Id__symbol].sourceLink;
  }

  /**
   * A context of the order this context has been created in.
   */
  get createdIn(): OrderContext {
    return this.#createdIn;
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
   * Checks whether this unit received any instructions.
   *
   * The unit instance can be used purely as a reference until it receives any instructions.
   */
  get hasInstructions(): boolean {
    return !!this.#backend;
  }

  /**
   * Unit supply.
   *
   * The unit is withdrawn once this supply cut off.
   */
  get supply(): Supply {
    return this[Unit$Backend__symbol].supply;
  }

  /**
   * Records an instruction for this unit to apply later.
   *
   * Once the unit arrives to deployment formation, the recorded instruction will be applied.
   *
   * This method can be called only {@link OrderContext.Entry.current within order}.
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
    this.supply.off();

    return this;
  }

  toLog(target: DueSqdnLog.Target): void | unknown {

    const { on = 'out', index, zDetails } = target;

    if (!zDetails || index) {
      return this.toString();
    }
    if (on !== 'out') {
      return;
    }

    zDetails.unit = {
      name: this.constructor.unitName,
      uid: this.uid,
      src: this.sourceLink,
    };

    return [];
  }

  toString(): string {

    const { prefix, suffix } = this[Unit$Id__symbol];
    let uid: string;

    if (prefix.length > 1) {
      if (suffix.length > 9) {
        uid = `${prefix.slice(0, -1)}...${suffix.slice(-7)}`;
      } else {
        uid = this.uid;
      }
    } else if (suffix.length > 10) {
      uid = `...${suffix.slice(-7)}`;
    } else {
      uid = this.uid;
    }

    const { unitName } = this.constructor;

    return `[${unitName} ${uid}(${this.sourceLink})]`;
  }

}

export interface Unit {

  constructor: Unit.Class<this>;

}

export namespace Unit {

  /**
   * Executive order initialization options.
   */
  export interface Init {

    /**
     * A context of the order creating the unit.
     *
     * Defaults to {@link OrderContext.Entry.current current one}.
     */
    readonly createdIn?: OrderContext | undefined;

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

  /**
   * Unit class constructor.
   *
   * @typeParam TUnit - Unit type.
   */
  export interface Class<TUnit extends Unit = Unit> extends Function {

    prototype: TUnit;

    /**
     * The name of the unit instance of this type.
     *
     * Displayed in unit's string representation.
     */
    unitName: string;

    new (init?: Init): TUnit;

  }

}
