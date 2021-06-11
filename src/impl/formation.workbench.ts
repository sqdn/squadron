import { Workbench, WorkStage } from '@proc7ts/workbench';
import { Unit$Workbench } from '../unit/unit.workbench.impl';

export class Formation$Workbench extends Unit$Workbench {

  private readonly _promulgationStage: WorkStage;
  readonly _executionStage: WorkStage;

  constructor() {
    super();
    this._promulgationStage = new WorkStage('promulgation');
    this._executionStage = new WorkStage('execution', { after: this._promulgationStage });
  }

  promulgate(task: Workbench.Task<void>): void {
    this._run(this._promulgationStage, task);
  }

  execute(task: Workbench.Task<void>): void {
    return this._run(this._executionStage, task);
  }

}
