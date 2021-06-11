import { Workbench, WorkStage } from '@proc7ts/workbench';
import { Unit$Workbench } from '../unit/unit.workbench.impl';

export class Order$Workbench extends Unit$Workbench {

  private readonly _promulgationStage: WorkStage;
  private readonly _executionStage: WorkStage;
  private readonly _deliveryStage: WorkStage;
  private readonly _finalStage: WorkStage;

  start!: () => void;

  constructor() {
    super();

    const canExec = new Promise<void>(resolve => this.start = resolve);

    this._promulgationStage = new WorkStage('order promulgation', { start: (_work: WorkStage.Work) => canExec });
    this._executionStage = new WorkStage('order execution', { after: this._promulgationStage });
    this._deliveryStage = new WorkStage('unit delivery', { after: this._executionStage });
    this._finalStage = new WorkStage('order done', { after: this._deliveryStage });
  }

  promulgate(task: Workbench.Task<void>): void {
    this._run(this._promulgationStage, task);
  }

  execute(task: Workbench.Task<void>): void {
    return this._run(this._executionStage, task);
  }

  deliver(task: Workbench.Task<void>): void {
    return this._run(this._deliveryStage, task);
  }

  finalize(task: Workbench.Task<void>): void {
    return this._run(this._finalStage, task);
  }

}
