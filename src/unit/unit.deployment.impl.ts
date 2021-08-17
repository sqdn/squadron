import { Formation } from '../formation';
import { Formation$Host } from '../impl';
import { OrderInstruction, OrderSubject } from '../order';
import { Unit } from './unit';
import { UnitContext } from './unit-context';
import { Unit$Backend } from './unit.backend.impl';
import { Unit$Backend$OrderSubject } from './unit.backend.order-subject.impl';
import { UnitContext$create } from './unit.context.impl';

export class Unit$Deployment<TUnit extends Unit> extends Unit$Backend<TUnit, Formation$Host> {

  #context?: UnitContext;

  get context(): UnitContext {
    return this.#context ||= UnitContext$create(this.host, this.unit);
  }

  instruct(instruction: OrderInstruction<TUnit>): void {

    let subject: OrderSubject<TUnit> | null = new Unit$Backend$OrderSubject(this, this.supply.derive());

    subject.supply.whenOff(_ => subject = null);

    this.host.workbench.accept(async () => {
      if (subject) {
        try {
          await instruction(subject);
        } catch (error) {
          this.host.log.error(`Instructions for ${this.unit} rejected`, error);
          subject.supply.off(error);
        }
      }
    });
  }

  deployTo(formation: Formation): void {
    this.host.log.warn(`${this.unit} can not be deployed to ${formation} outside the order`);
  }

}
