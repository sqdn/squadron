import { CxEntry, cxSingle } from '@proc7ts/context-values';
import { Unit } from '../unit';
import { Unit$Backend__symbol } from '../unit/unit.backend.impl';

const Formation$perContext: CxEntry.Definer<Formation> = (/*#__PURE__*/ cxSingle());

/**
 * Executive units formation representation.
 *
 * A formation created by {@link Hub} per each {@link Formation representation} within order(s).
 *
 * A thread worker and a {@link FormationContext IoC context} created for formation, along with some basic services.
 *
 * Each formation is able to evaluate and execute orders. A formation executes only parts of the order related to it
 * and ignores the rest of the order.
 *
 * The primary formation duty is to {@link deploy} executive units.
 */
export class Formation extends Unit {

  static perContext(target: CxEntry.Target<Formation>): CxEntry.Definition<Formation> {
    return Formation$perContext(target);
  }

  static override toString(): string {
    return '[Formation]';
  }

  /**
   * Instructs to deploy the given executive unit to target formation.
   *
   * The unit will be actually deployed when order executed within actual formation.
   *
   * @param unit - An executive unit to deploy.
   *
   * @returns `this` instance.
   */
  deploy(unit: Unit): this {

    const { host } = this[Unit$Backend__symbol];

    if (host && host.formation.uid === this.uid) {
      unit[Unit$Backend__symbol].deployTo(this);
    }

    return this;
  }

}
