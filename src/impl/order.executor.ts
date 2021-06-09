import { ContextKey, ContextKey__symbol, ContextValues, SingleContextKey } from '@proc7ts/context-values';
import { noop, valueProvider } from '@proc7ts/primitives';
import { Workbench, WorkStage } from '@proc7ts/workbench';
import { UnitLogger } from '../common';
import { Formation } from '../formation';
import { Formation__key } from '../formation/formation.key.impl';
import { Unit } from '../unit';
import { Formation$Executor } from './formation.executor';
import { Unit$Executor } from './unit.executor';

const OrderExecutor__key: ContextKey<Order$Executor> = (/*#__PURE__*/ new SingleContextKey<Order$Executor>(
    'Order.executor',
    {
      byDefault(context: ContextValues): Order$Executor {
        return new Order$Executor(context);
      },
    },
));

export class Order$Executor {

  static get [ContextKey__symbol](): ContextKey<Order$Executor> {
    return OrderExecutor__key;
  }

  readonly log: UnitLogger;
  readonly workbench = new Workbench();
  readonly evaluationStage: WorkStage;
  readonly promulgationStage: WorkStage;
  readonly executionStage: WorkStage;

  private readonly _formations = new Map<string, Formation$Executor>();
  private readonly _units = new Map<string, Unit$Executor<any>>();
  private _start!: () => void;
  private readonly _whenDone: Promise<void>;
  private _done!: () => void;
  private _failed!: (error: unknown) => void;

  evaluate: (this: this) => void;

  constructor(private readonly _context: ContextValues) {
    // Evaluate lazily to allow to provide the `Formation` instance for `Order` context.
    // Otherwise this would cause an infinite recursion.
    this.log = _context.get(UnitLogger);

    const whenStarted = new Promise<void>(resolve => this._start = resolve);

    this.evaluationStage = new WorkStage(
        'order evaluation',
        {
          start: (_work: WorkStage.Work) => whenStarted,
        },
    );
    this.promulgationStage = new WorkStage('order promulgation', { after: this.evaluationStage });
    this.executionStage = new WorkStage('order execution', { after: this.promulgationStage });

    this._whenDone = new Promise((resolve, reject) => {
      this._done = () => {
        resolve();
        this._failed = this._reExecutionFailed;
      };
      this._failed = error => {
        reject(error);
        this._failed = this._reExecutionFailed;
      };
    });
    this.evaluate = this._doEvaluate;
  }

  currentFormation(): Formation {

    const formation = this._context.get(Formation__key);

    this.currentFormation = valueProvider(formation);
    this.formation(formation).deploy(formation);

    return formation;
  }

  formation(formation: Formation): Formation$Executor {

    let formationExecutor = this._formations.get(formation.uid);

    if (!formationExecutor) {
      formationExecutor = new Formation$Executor(this, formation);
      this._formations.set(formation.uid, formationExecutor);
    }

    return formationExecutor;
  }

  unit<TUnit extends Unit>(unit: TUnit): Unit$Executor<TUnit> {

    let unitExecutor = this._units.get(unit.uid);

    if (!unitExecutor) {
      unitExecutor = new Unit$Executor<TUnit>(this, unit);
      this._units.set(unit.uid, unitExecutor);
    }

    return unitExecutor;
  }

  execute(): Promise<void> {
    this._start();
    this.evaluate();
    return this._whenDone;
  }

  private _doEvaluate(): void {
    this.evaluate = noop; // Initiate the order evaluation only once.
    this.workbench
        .work(this.evaluationStage)
        .run(() => {
          this.evaluate = this._doEvaluate;
        })
        .catch(noop);
    this.workbench
        .work(this.executionStage)
        .run(() => {
          // TODO Actually start execution
          this._done();
        })
        .catch(error => {
          this._failed(error);
        });
  }

  private _reExecutionFailed(error: unknown): void {
    this.log.error('Order re-execution error', error);
  }

}
