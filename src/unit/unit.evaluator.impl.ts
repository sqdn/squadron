import { noop, valueProvider } from '@proc7ts/primitives';
import { Formation } from '../formation';
import { Order$Evaluator } from '../impl';
import { OrderPromulgation, OrderPromulgator } from '../order';
import { Unit } from './unit';
import { UnitTask } from './unit-task';
import { Unit$Backend, Unit$Backend__symbol, Unit$doNotStart, Unit$rejectOrder } from './unit.backend.impl';
import { Unit$Id__symbol } from './unit.id.impl';

export class Unit$Evaluator<TUnit extends Unit> extends Unit$Backend<TUnit, Order$Evaluator> {

  private readonly _promulgators: OrderPromulgator<TUnit>[] = [];

  order(promulgator: OrderPromulgator<TUnit>): void {
    this._promulgators.push(promulgator);
  }

  deployTo(formation: Formation): void {
    this.supply.needs(formation);

    const { host } = this;
    const { workbench, log } = host;

    let execute = (task: UnitTask<TUnit>): void => workbench.execute(async () => {
      try {
        await host.executeUnitTask(this.unit, task);
      } catch (error) {
        log.error(`Failed to start ${this.unit}`, error);
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
      workbench.promulgate(async () => {
        if (promulgation) {
          try {
            await promulgator(promulgation);
          } catch (error) {
            this.supply.off(error);
            log.error(`Failed to promulgate the orders for ${this.unit}`, error);
          }
        }
      });
    };

    if (!this.supply.isOff) {
      for (const promulgator of this._promulgators) {
        promulgate(promulgator);
      }
      this._promulgators.length = 0;
      this.order = promulgate;
      this.host.workbench.deliver(() => this._deliver());
    }

    this.supply.whenOff(reason => {
      this.order = Unit$rejectOrder;
      this._deliver = noop;
      this._promulgators.length = 0;
      promulgation = null;
      execute = Unit$doNotStart(reason);
    });
  }

  private _deliver(): void {

    const deployment = this.host.host.unitDeployment(this.unit);

    // Reuse the same `Unit$Id` instance to potentially free some memory.
    this.unit[Unit$Id__symbol] = deployment.unit[Unit$Id__symbol];

    // Replace unit evaluator with unit deployment.
    this.unit[Unit$Backend__symbol] = valueProvider(deployment);

    // Evaluator depends on deployment from now on.
    this.supply.needs(deployment.supply);
  }

}
