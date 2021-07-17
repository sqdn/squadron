import { CxEntry, cxSingle } from '@proc7ts/context-values';
import { Unit } from '../unit';
import { Unit$Backend__symbol } from '../unit/unit.backend.impl';

const Formation$perContext: CxEntry.Definer<Formation> = (/*#__PURE__*/ cxSingle());

export class Formation extends Unit {

  static perContext(target: CxEntry.Target<Formation>): CxEntry.Definition<Formation> {
    return Formation$perContext(target);
  }

  static override toString(): string {
    return '[Formation]';
  }

  deploy(unit: Unit): this {

    const { host } = this[Unit$Backend__symbol];

    if (host && host.formation.uid === this.uid) {
      unit[Unit$Backend__symbol].deployTo(this);
    }

    return this;
  }

}
