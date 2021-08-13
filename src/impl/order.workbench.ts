import { Workbench, WorkStage } from '@proc7ts/workbench';
import { Unit$Workbench } from '../unit/unit.workbench.impl';

export class Order$Workbench extends Unit$Workbench {

  readonly #acceptanceStage: WorkStage;
  readonly #executionStage: WorkStage;
  readonly #deliveryStage: WorkStage;
  readonly #finalStage: WorkStage;

  start!: () => void;

  constructor() {
    super();

    const canExec = new Promise<void>(resolve => this.start = resolve);

    this.#acceptanceStage = new WorkStage('acceptance', { start: (_work: WorkStage.Work) => canExec });
    this.#executionStage = new WorkStage('execution', { after: this.#acceptanceStage });
    this.#deliveryStage = new WorkStage('delivery', { after: this.#executionStage });
    this.#finalStage = new WorkStage('final', { after: this.#deliveryStage });
  }

  accept(task: Workbench.Task<void>): void {
    this._run(this.#acceptanceStage, task);
  }

  execute(task: Workbench.Task<void>): void {
    return this._run(this.#executionStage, task);
  }

  deliver(task: Workbench.Task<void>): void {
    return this._run(this.#deliveryStage, task);
  }

  finalize(task: Workbench.Task<void>): void {
    return this._run(this.#finalStage, task);
  }

}
