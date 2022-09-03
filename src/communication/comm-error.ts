import { Unit } from '../unit';

/**
 * Communication error.
 */
export class CommError extends TypeError {

  readonly #unit: Unit;
  readonly #reason: unknown;

  /**
   * Constructs communication error.
   *
   * @param unit - Target unit the communication failed with.
   * @param message - Optional error message.
   * @param reason - Optional communication failure reason.
   */
  constructor(unit: Unit, message = `Error communicating with ${unit}`, reason?: unknown) {
    super(reason === undefined ? message : `${message}. ${reason}`);
    this.#unit = unit;
    this.#reason = reason;
  }

  override get name(): string {
    return 'CommError';
  }

  /**
   * Target unit the communication failed with.
   */
  get unit(): Unit {
    return this.#unit;
  }

  /**
   * Communication failure reason, or `undefined` when missing.
   */
  get reason(): unknown | undefined {
    return this.#reason;
  }

}
