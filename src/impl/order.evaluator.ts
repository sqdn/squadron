import { ContextKey, ContextKey__symbol, SingleContextKey } from '@proc7ts/context-values';
import { noop } from '@proc7ts/primitives';
import { Workbench } from '@proc7ts/workbench';
import Order from '@sqdn/order';
import { UnitLogger } from '../common';
import { Formation } from '../formation';
import { Unit, UnitTask } from '../unit';
import { Unit$Evaluator } from '../unit/unit.evaluator.impl';
import { Unit$Host } from '../unit/unit.host.impl';
import { Unit$Workbench } from '../unit/unit.workbench.impl';
import { Formation$Host } from './formation.host';
import { Order$Workbench } from './order.workbench';

const Order$Evaluator__key: ContextKey<Order$Evaluator> = (/*#__PURE__*/ new SingleContextKey<Order$Evaluator>(
    'Order.evaluator',
    {
      byDefault(context) {
        return new Order$Evaluator(context.get(Order));
      },
    },
));

export class Order$Evaluator implements Unit$Host {

  static get [ContextKey__symbol](): ContextKey<Order$Evaluator> {
    return Order$Evaluator__key;
  }

  private readonly _workbench = new Order$Workbench();
  readonly host: Formation$Host;
  private readonly _whenExecuted: Promise<void>;
  private readonly _units = new Map<string, Unit$Evaluator<any>>();

  constructor(readonly order: Order) {
    this.host = order.get(Formation$Host);

    let executed!: () => void;

    this._whenExecuted = new Promise(resolve => executed = resolve);

    // Ensure all stages executed in order.
    this._workbench.promulgate(() => {
      this.formation.deploy(this.formation);
    });
    this._workbench.execute(noop);
    this._workbench.deliver(noop);
    this._workbench.finalize(executed);
  }

  get log(): UnitLogger {
    return this.order.active ? this.order.get(UnitLogger) : this.host.log;
  }

  get workbench(): Unit$Workbench {
    return this.order.active ? this._workbench : this.host.workbench;
  }

  get formation(): Formation {
    return this.host.formation;
  }

  executeUnitTask<TUnit extends Unit>(unit: TUnit, task: UnitTask<TUnit>): Promise<void> {
    return this.host.executeUnitTask(unit, task);
  }

  executeOrder(): Promise<void> {
    this._workbench.start();
    return this._whenExecuted;
  }

  evalUnit<TUnit extends Unit>(unit: TUnit): Unit$Evaluator<TUnit> {

    let evaluator = this._units.get(unit.uid);

    if (!evaluator) {
      evaluator = new Unit$Evaluator<TUnit>(this, unit);
      this._units.set(unit.uid, evaluator);
    }

    return evaluator;
  }

  deliver(task: Workbench.Task<void>): void {
    this._workbench.deliver(task);
  }

}