import { noop } from '@proc7ts/primitives';
import { Formation } from '../formation';
import { Order$Evaluator } from '../impl';
import { OrderPromulgation, OrderPromulgator } from '../order';
import { Unit } from './unit';
import { UnitTask } from './unit-task';
import { Unit$Backend, Unit$Backend__symbol, Unit$doNotStart, Unit$rejectOrder } from './unit.backend.impl';
import { Unit$Id__symbol } from './unit.id.impl';

export class Unit$Evaluator<TUnit extends Unit> extends Unit$Backend<TUnit, Order$Evaluator> {

  readonly #promulgators: OrderPromulgator<TUnit>[] = [];

  order(promulgator: OrderPromulgator<TUnit>): void {
    this.#promulgators.push(promulgator);
  }

  deployTo(formation: Formation): void {
    this.supply.needs(formation);

    const { host } = this;

    let execute = (task: UnitTask<TUnit>): void => host.workbench.execute(async () => {
      try {
        await host.executeUnitTask(this.unit, task);
      } catch (error) {
        host.log.error(`Failed to start ${this.unit}`, error);
        this.supply.off(error);
      }
    });
    let promulgation: OrderPromulgation<TUnit> | null = {
      formation,
      unit: this.unit,
      supply: this.supply,
      execute: task => execute(task),
    };

    const promulgate = (promulgator: OrderPromulgator<TUnit>): void => {
      host.workbench.promulgate(async () => {
        if (promulgation) {
          try {
            await promulgator(promulgation);
          } catch (error) {
            this.supply.off(error);
            host.log.error(`Failed to promulgate the orders for ${this.unit}`, error);
          }
        }
      });
    };

    if (!this.supply.isOff) {
      for (const promulgator of this.#promulgators) {
        promulgate(promulgator);
      }
      this.#promulgators.length = 0;
      this.order = promulgate;
      this.host.deliver(() => this._deliver());
    }

    this.supply.whenOff(reason => {
      this.order = Unit$rejectOrder;
      this._deliver = noop; // Do not deliver withdrawn unit.
      this.#promulgators.length = 0;
      promulgation = null;
      execute = Unit$doNotStart(reason);
    });
  }

  private _deliver(): void {

    const deployment = this.host.host.unitDeployment(this.unit);

    // Reuse the same `Unit$Id` instance to potentially free some memory.
    this.unit[Unit$Id__symbol] = deployment.unit[Unit$Id__symbol];

    // Replace unit evaluator with unit deployment.
    this.unit[Unit$Backend__symbol] = deployment;

    // Evaluator depends on deployment from now on.
    this.supply.needs(deployment.supply);
  }

}
