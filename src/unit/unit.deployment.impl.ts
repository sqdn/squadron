import { lazyValue } from '@proc7ts/primitives';
import { Supply } from '@proc7ts/supply';
import { Formation } from '../formation';
import { Formation$Host } from '../impl';
import { OrderPromulgation, OrderPromulgator } from '../order';
import { Unit } from './unit';
import { UnitContext } from './unit-context';
import { newUnitContext } from './unit-context.impl';
import { UnitTask } from './unit-task';
import { Unit$Backend, Unit$doNotStart } from './unit.backend.impl';

export class Unit$Deployment<TUnit extends Unit> extends Unit$Backend<TUnit, Formation$Host> {

  readonly context: () => UnitContext = lazyValue(() => newUnitContext(this.host, this.unit));

  order(promulgator: OrderPromulgator<TUnit>): void {

    const { host, unit } = this;
    const { formation, workbench, log } = host;
    const supply = new Supply().needs(this.supply);
    let execute = (task: UnitTask<TUnit>): void => workbench.execute(async () => {
      try {
        await host.executeUnitTask(this.unit, task);
      } catch (error) {
        log.error(`Failed to execute ${this.unit}`, error);
        supply.off(error);
      }
    });
    let promulgation: OrderPromulgation<TUnit> | null = {
      formation,
      unit,
      supply,
      execute: task => execute(task),
    };

    supply.whenOff(reason => {
      promulgation = null;
      execute = Unit$doNotStart(reason);
    });

    workbench.promulgate(async () => {
      if (promulgation) {
        try {
          await promulgator(promulgation);
        } catch (error) {
          log.error(`Failed to promulgate the orders for ${unit}`, error);
          supply.off(error);
        }
      }
    });
  }

  deployTo(formation: Formation): void {
    this.host.log.warn(`${this.unit} can not be deployed to ${formation} outside the order`);
  }

}
