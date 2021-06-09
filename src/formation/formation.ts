import { ContextKey, ContextKey__symbol } from '@proc7ts/context-values';
import { lazyValue } from '@proc7ts/primitives';
import Order from '@sqdn/order';
import { Formation$Executor, Formation$Executor__symbol, Order$Executor } from '../impl';
import { Unit } from '../unit';
import { Formation__key } from './formation.key.impl';

export class Formation extends Unit {

  static get [ContextKey__symbol](): ContextKey<Formation> {
    return Formation__key;
  }

  /**
   * @internal
   */
  private readonly [Formation$Executor__symbol]: () => Formation$Executor;

  constructor(init?: Unit.Init) {
    super(init);
    this[Formation$Executor__symbol] = lazyValue(() => Order.get(Order$Executor).formation(this));
  }

  deploy(unit: Unit): this {
    this[Formation$Executor__symbol]().deploy(unit);
    return this;
  }

  override off(): this {
    super.off();
    this[Formation$Executor__symbol]().supply.off();
    return this;
  }

}
