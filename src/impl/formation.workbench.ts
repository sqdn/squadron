import { noop } from '@proc7ts/primitives';
import { Workbench, WorkStage } from '@proc7ts/workbench';
import { Unit$Workbench } from '../unit/unit.workbench.impl';

export class Formation$Workbench extends Unit$Workbench {

  readonly #promulgationStage: WorkStage;
  readonly #executionStage: WorkStage;

  constructor() {
    super();
    this.#promulgationStage = new WorkStage('promulgation');
    this.#executionStage = new WorkStage('execution', { after: this.#promulgationStage });
  }

  promulgate(task: Workbench.Task<void>): void {
    this._run(this.#promulgationStage, task);
  }

  execute(task: Workbench.Task<void>): void {
    return this._run(this.#executionStage, task);
  }

  evaluate(): Promise<void> {
    return this.workbench.work(this.#executionStage).run(noop);
  }

}
