import { noop } from '@proc7ts/primitives';
import { Workbench, WorkStage } from '@proc7ts/workbench';

export abstract class Unit$Workbench {

  readonly workbench = new Workbench();

  abstract promulgate(task: Workbench.Task<void>): void;

  abstract execute(task: Workbench.Task<void>): void;

  protected _run(stage: WorkStage, task: Workbench.Task<void>): void {
    this.workbench.work(stage).run(task).catch(noop);
  }

}
