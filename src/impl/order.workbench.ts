import { AfterEvent, trackValue } from '@proc7ts/fun-events';
import { newPromiseResolver, noop, PromiseResolver } from '@proc7ts/primitives';
import { Workbench, WorkStage } from '@proc7ts/workbench';
import { UnitStatus } from '../unit';

const enum Order$StageId {
  None = 0,
  Instruction,
  Withdrawal,
  Execution,
  Readiness,
  First = Instruction,
  Last = Readiness,
}

export class Order$Workbench {

  readonly #workbench = new Workbench();
  readonly #instructionStage: Order$Stage;
  readonly #withdrawalStage: Order$Stage;
  readonly #executionStage: Order$Stage;
  readonly #readinessStage: Order$Stage;
  readonly #stages: Order$Stage[] = [];
  readonly #status = trackValue<UnitStatus>(UnitStatus.Idle);

  #runningStageId: Order$StageId = Order$StageId.None;
  readonly #stageStarters = new Array<PromiseResolver | undefined>(Order$StageId.Last);
  readonly #stageTaskCounts: number[] = new Array<number>(Order$StageId.Last + 1);
  #whenExecuted!: PromiseResolver;
  #pendingTasks: (() => void)[] = [];

  constructor() {
    this.#instructionStage = new Order$Stage(
      this,
      Order$StageId.Instruction,
      UnitStatus.Instructed,
      'instruction',
    );
    this.#withdrawalStage = new Order$Stage(
      this,
      Order$StageId.Withdrawal,
      UnitStatus.Instructed,
      'withdrawal',
    );
    this.#executionStage = new Order$Stage(
      this,
      Order$StageId.Execution,
      UnitStatus.Executed,
      'execution',
    );
    this.#readinessStage = new Order$Stage(
      this,
      Order$StageId.Readiness,
      UnitStatus.Ready,
      'readiness',
    );
  }

  get readStatus(): AfterEvent<[UnitStatus]> {
    return this.#status.read;
  }

  executeOrder(): Promise<void> {
    return this.#runningStageId
      ? this.#whenExecuted.promise().then(() => this.executeOrder())
      : this.#startExecution().promise();
  }

  #startExecution(): PromiseResolver {
    this.#startStage(Order$StageId.First);

    return (this.#whenExecuted = newPromiseResolver());
  }

  addStage(stage: Order$Stage): void {
    this.#stages[stage.stageId] = stage;
  }

  canStartStage(stageId: Order$StageId): Promise<void> {
    return this.#stageStarter(stageId).promise().then(noop); // Delay required to resolve empty order evaluation issue.
  }

  #stageStarter(stageId: Order$StageId): PromiseResolver {
    return (this.#stageStarters[stageId] ||= newPromiseResolver());
  }

  #startStage(stageId: Order$StageId): void {
    this.#runningStageId = stageId;
    this.#run(this.#stages[stageId], noop);
    this.#stageStarter(stageId).resolve();
  }

  instruct(task: Workbench.Task<void>): void {
    this.#run(this.#instructionStage, task);
  }

  withdraw(task: Workbench.Task<void>): void {
    return this.#run(this.#withdrawalStage, task);
  }

  execute(task: Workbench.Task<void>): void {
    return this.#run(this.#executionStage, task);
  }

  ready(task: Workbench.Task<void>): void {
    return this.#run(this.#readinessStage, task);
  }

  #run(stage: Order$Stage, task: Workbench.Task<void>): void {
    const { stageId } = stage;

    if (stageId < this.#runningStageId) {
      this.#pendingTasks.push(() => this.#run(stage, task));

      return;
    }

    const orderTask: Workbench.Task<void> = async () => {
      try {
        await task();
      } finally {
        if (!--this.#stageTaskCounts[stageId]) {
          this.#endStage(stage);
        }
      }
    };

    this.#stageTaskCounts[stageId] = (this.#stageTaskCounts[stageId] ?? 0) + 1;
    this.#workbench.work(stage).run(orderTask).catch(noop);
  }

  #endStage({ stageId, endStatus }: Order$Stage): void {
    this.#stageStarters[stageId] = undefined;
    if (this.#status.it < endStatus) {
      this.#status.it = endStatus;
    }
    if (stageId < Order$StageId.Last) {
      this.#startStage(stageId + 1);
    } else if (this.#pendingTasks.length) {
      this.#restartExecution();
    } else {
      this.#endExecution();
    }
  }

  #restartExecution(): void {
    this.#startStage(Order$StageId.First);

    const tasks = this.#pendingTasks;

    this.#pendingTasks = [];
    tasks.forEach(task => task());
  }

  #endExecution(): void {
    this.#runningStageId = Order$StageId.None;
    this.#whenExecuted.resolve();
  }

}

class Order$Stage extends WorkStage {

  constructor(
    workbench: Order$Workbench,
    readonly stageId: Order$StageId,
    readonly endStatus: UnitStatus,
    name: string,
  ) {
    super(name, { start: _ => workbench.canStartStage(stageId) });
    workbench.addStage(this);
  }

}
