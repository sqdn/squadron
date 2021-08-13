import { CxEntry, cxSingle } from '@proc7ts/context-values';
import { Logger } from '@proc7ts/logger';
import { noop } from '@proc7ts/primitives';
import { Workbench } from '@proc7ts/workbench';
import Order from '@sqdn/order';
import { Formation } from '../formation';
import { Hub } from '../hub';
import { OrderTask } from '../order';
import { Unit } from '../unit';
import { Unit$Evaluator } from '../unit/unit.evaluator.impl';
import { Unit$Host } from '../unit/unit.host.impl';
import { Unit$Workbench } from '../unit/unit.workbench.impl';
import { Formation$Host } from './formation.host';
import { Order$Workbench } from './order.workbench';

const Order$Evaluator$perContext: CxEntry.Definer<Order$Evaluator> = (/*#__PURE__*/ cxSingle({
  byDefault: target => new Order$Evaluator(target.get(Order.entry)),
}));

export class Order$Evaluator implements Unit$Host {

  static perContext(target: CxEntry.Target<Order$Evaluator>): CxEntry.Definition<Order$Evaluator> {
    return Order$Evaluator$perContext(target);
  }

  static toString(): string {
    return '[Order:Evaluator]';
  }

  readonly host: Formation$Host;
  readonly #workbench = new Order$Workbench();
  readonly #whenExecuted: Promise<void>;
  readonly #units = new Map<string, Unit$Evaluator<any>>();

  constructor(readonly order: Order) {
    this.host = order.get(Formation$Host);

    let executed!: () => void;

    this.#whenExecuted = new Promise(resolve => executed = resolve);

    // Ensure all stages executed in order.
    this.#workbench.accept(() => {
      this.formation.deploy(this.formation);
    });
    this.#workbench.execute(noop);
    this.#workbench.deliver(noop);
    this.#workbench.finalize(executed);
  }

  get log(): Logger {
    return this.order.get(Logger);
  }

  get workbench(): Unit$Workbench {
    return this.#workbench;
  }

  get hub(): Hub {
    return this.host.hub;
  }

  get formation(): Formation {
    return this.host.formation;
  }

  deploy(formation: Formation, unit: Unit): void {
    this.host.deploy(formation, unit);
  }

  executeTask<TUnit extends Unit>(unit: TUnit, task: OrderTask<TUnit>): Promise<void> {
    return this.host.executeTask(unit, task);
  }

  executeOrder(): Promise<void> {
    this.#workbench.start();
    return this.#whenExecuted;
  }

  evalUnit<TUnit extends Unit>(unit: TUnit): Unit$Evaluator<TUnit> {

    let evaluator = this.#units.get(unit.uid);

    if (!evaluator) {
      evaluator = new Unit$Evaluator<TUnit>(this, unit);
      this.#units.set(unit.uid, evaluator);
    }

    return evaluator;
  }

  deliver(task: Workbench.Task<void>): void {
    this.#workbench.deliver(task);
  }

}
