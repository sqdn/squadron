import { Workbench, WorkStage } from '@proc7ts/workbench';
import { Unit$Workbench } from '../unit/unit.workbench.impl';

export class Order$Workbench extends Unit$Workbench {

  private readonly promulgationStage: WorkStage;
  private readonly executionStage: WorkStage;
  private readonly deliveryStage: WorkStage;
  private readonly finalStage: WorkStage;

  start!: () => void;

  constructor() {
    super();

    const canExec = new Promise<void>(resolve => this.start = resolve);

    this.promulgationStage = new WorkStage('order promulgation', { start: (_work: WorkStage.Work) => canExec });
    this.executionStage = new WorkStage('order execution', { after: this.promulgationStage });
    this.deliveryStage = new WorkStage('unit delivery', { after: this.executionStage });
    this.finalStage = new WorkStage('order done', { after: this.deliveryStage });
  }

  promulgate(task: Workbench.Task<void>): void {
    this._run(this.promulgationStage, task);
  }

  execute(task: Workbench.Task<void>): void {
    return this._run(this.executionStage, task);
  }

  deliver(task: Workbench.Task<void>): void {
    return this._run(this.deliveryStage, task);
  }

  finalize(task: Workbench.Task<void>): void {
    return this._run(this.finalStage, task);
  }

}
