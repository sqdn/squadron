import { CxBuilder } from '@proc7ts/context-builder';
import { AfterEvent, trackValue, ValueTracker } from '@proc7ts/fun-events';
import { Formation } from '../formation';
import { Formation$Host } from '../impl';
import { OrderInstruction, OrderSubject } from '../order';
import { Unit } from './unit';
import { UnitContext } from './unit-context';
import { UnitStatus } from './unit-status';
import { Unit$Backend } from './unit.backend.impl';
import { UnitContext$createBuilder } from './unit.context.impl';
import { Unit$OrderSubject } from './unit.order-subject.impl';

export class Unit$Deployment<TUnit extends Unit = Unit> extends Unit$Backend<TUnit, Formation$Host> {

  readonly builder: CxBuilder<UnitContext<TUnit>>;
  readonly #status: ValueTracker<UnitStatus>;

  constructor(host: Formation$Host, unit: TUnit) {
    super(host, unit);
    this.#status = trackValue(UnitStatus.Arrived);
    this.builder = UnitContext$createBuilder(this);
  }

  get context(): UnitContext<TUnit> {
    return this.builder.context;
  }

  get readStatus(): AfterEvent<[UnitStatus]> {
    return this.#status.read;
  }

  setStatus(status: UnitStatus): void {
    this.#status.it = status;
  }

  instruct(instruction: OrderInstruction<TUnit>): void {

    let subject: OrderSubject<TUnit> | null = new Unit$OrderSubject(this, this.supply.derive());

    subject.supply.whenOff(_ => subject = null);

    this.host.workbench.instruct(async () => {
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
