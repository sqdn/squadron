import { newPromiseResolver, noop, PromiseResolver } from '@proc7ts/primitives';
import { Workbench, WorkStage } from '@proc7ts/workbench';

const enum Order$StageId {
  None,
  Acceptance,
  Execution,
  Delivery,
  First = Acceptance,
  Last = Delivery,
}

export class Order$Workbench {

  readonly #workbench = new Workbench();
  readonly #acceptanceStage: Order$Stage;
  readonly #executionStage: Order$Stage;
  readonly #deliveryStage: Order$Stage;
  readonly #stages: Order$Stage[] = [];

  #runningStageId: Order$StageId = Order$StageId.None;
  readonly #stageStarters = new Array<PromiseResolver | undefined>(Order$StageId.Last);
  #whenExecuted!: PromiseResolver;
  #pendingTasks: (() => void)[] = [];
  readonly #lastTasks = new Array<Workbench.Task<unknown> | undefined>(Order$StageId.Last + 1);

  constructor() {
    this.#acceptanceStage = new Order$Stage(
        this,
        Order$StageId.Acceptance,
        'acceptance',
    );
    this.#executionStage = new Order$Stage(
        this,
        Order$StageId.Execution,
        'execution',
    );
    this.#deliveryStage = new Order$Stage(
        this,
        Order$StageId.Delivery,
        'delivery',
    );
  }

  executeOrder(): Promise<void> {
    return this.#runningStageId
        ? this.#whenExecuted.promise().then(() => this.executeOrder())
        : this.#startExecution().promise();
  }

  #startExecution(): PromiseResolver {
    this.#startStage(Order$StageId.First);
    return this.#whenExecuted = newPromiseResolver();
  }

  addStage(stage: Order$Stage): void {
    this.#stages[stage.stageId] = stage;
  }

  canStartStage(stageId: Order$StageId): Promise<void> {
    return this.#stageStarter(stageId).promise().then(noop); // Delay required to resolve empty order evaluation issue.
  }

  #stageStarter(stageId: Order$StageId): PromiseResolver {
    return this.#stageStarters[stageId] ||= newPromiseResolver();
  }

  #startStage(stageId: Order$StageId): void {
    this.#runningStageId = stageId;
    this.#run(this.#stages[stageId], noop);
    this.#stageStarter(stageId).resolve();
  }

  accept(task: Workbench.Task<void>): void {
    this.#run(this.#acceptanceStage, task);
  }

  execute(task: Workbench.Task<void>): void {
    return this.#run(this.#executionStage, task);
  }

  deliver(task: Workbench.Task<void>): void {
    return this.#run(this.#deliveryStage, task);
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
        if (this.#lastTasks[stageId] === orderTask) {
          this.#endStage(stage);
        }
      }
    };

    this.#lastTasks[stageId] = orderTask;
    this.#workbench.work(stage).run(orderTask).catch(noop);
  }

  #endStage({ stageId }: Order$Stage): void {
    this.#lastTasks[stageId] = undefined;
    this.#stageStarters[stageId] = undefined;
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
      name: string,
  ) {
    super(name, { start: _ => workbench.canStartStage(stageId) });
    workbench.addStage(this);
  }

}
