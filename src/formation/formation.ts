import { ContextKey, ContextKey__symbol } from '@proc7ts/context-values';
import { Unit } from '../unit';
import { Unit$Backend__symbol } from '../unit/unit.backend.impl';
import { Formation__key } from './formation.key.impl';

export class Formation extends Unit {

  static get [ContextKey__symbol](): ContextKey<Formation> {
    return Formation__key;
  }

  deploy(unit: Unit): this {

    const { host } = this[Unit$Backend__symbol]();

    if (host.formation.uid === this.uid) {
      unit[Unit$Backend__symbol]().deployTo(this);
    }

    return this;
  }

}
