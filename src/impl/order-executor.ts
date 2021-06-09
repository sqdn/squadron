import { ContextKey, ContextKey__symbol, ContextValues, SingleContextKey } from '@proc7ts/context-values';
import { noop } from '@proc7ts/primitives';
import { Workbench, WorkStage } from '@proc7ts/workbench';
import { UnitLogger } from '../common';
import { Formation } from '../formation';
import { OrderPromulgation, OrderPromulgator } from '../order';
import { Unit } from '../unit';

const OrderExecutor__key: ContextKey<OrderExecutor> = (/*#__PURE__*/ new SingleContextKey<OrderExecutor>(
    'order-executor',
));

export class OrderExecutor {

  static get [ContextKey__symbol](): ContextKey<OrderExecutor> {
    return OrderExecutor__key;
  }

  readonly logger: UnitLogger;
  readonly workbench = new Workbench();
  private _start!: () => void;
  readonly evaluationStage: WorkStage;
  readonly promulgationStage: WorkStage;
  readonly executionStage: WorkStage;

  private readonly _formations = new Map<string, OrderExecutor$Formation>();
  private readonly _units = new Map<string, OrderExecutor$Unit<any>>();

  constructor(context: ContextValues) {
    this.logger = context.get(UnitLogger);

    const whenStarted = new Promise<void>(resolve => this._start = resolve);

    this.evaluationStage = new WorkStage(
        'order evaluation',
        {
          start: (_work: WorkStage.Work) => whenStarted,
        },
    );
    this.promulgationStage = new WorkStage('order promulgation', { after: this.evaluationStage });
    this.executionStage = new WorkStage('order execution', { after: this.promulgationStage });
  }

  deploy(unit: Unit, formation: Formation): void {

    let fmn = this._formations.get(formation.uid);

    if (!fmn) {
      fmn = new OrderExecutor$Formation(formation);
      this._formations.set(formation.uid, fmn);
    }

    fmn.deploy(unit);
  }

  order<TUnit extends Unit>(unit: TUnit, promulgator: OrderPromulgator<TUnit>): void {

    let unt = this._units.get(unit.uid);

    if (!unt) {
      unt = new OrderExecutor$Unit<TUnit>(this, unit);
      this._units.set(unit.uid, unt);
    }

    unt.order(promulgator);
  }

  execute(): Promise<void> {
    this._start();
  }

}

class OrderExecutor$Formation {

  readonly deployments = new Set<string>();

  constructor(readonly formation: Formation) {
  }

  deploy(unit: Unit): void {
    this.deployments.add(unit.uid);
  }

}

class OrderExecutor$Unit<TUnit extends Unit> {

  private readonly _promulgation: () => OrderPromulgation<TUnit> = noop as () => any;

  constructor(
      private readonly _executor: OrderExecutor,
      readonly unit: Unit,
  ) {
  }

  order(promulgator: OrderPromulgator<TUnit>): void {
    this._executor.workbench
        .work(this._executor.promulgationStage)
        .run(() => promulgator(this._promulgation()))
        .catch(error => this._executor.logger.error(error));
  }

  deployTo(formation: Formation): Promise<unknown> {
    this
  }

}
