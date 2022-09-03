import { CxBuilder } from '@proc7ts/context-builder';
import { AfterEvent, trackValue, ValueTracker } from '@proc7ts/fun-events';
import { lazyValue } from '@proc7ts/primitives';
import { Formation } from '../formation';
import { Formation$Host } from '../impl';
import { OrderContext, OrderInstruction, OrderSubject } from '../order';
import { Unit } from './unit';
import { UnitContext } from './unit-context';
import { UnitStatus } from './unit-status';
import { Unit$Backend } from './unit.backend.impl';
import { UnitContext$createBuilder } from './unit.context.impl';
import { Unit$OrderSubject } from './unit.order-subject.impl';

export class Unit$Deployment<TUnit extends Unit = Unit> extends Unit$Backend<
  TUnit,
  Formation$Host
> {

  readonly builder: CxBuilder<UnitContext<TUnit>>;
  readonly #status: ValueTracker<UnitStatus>;

  constructor(host: Formation$Host, unit: TUnit) {
    super(host, unit);
    this.#status = trackValue(UnitStatus.Idle);
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
    const deployedIn = OrderContext.current();
    let getSubject: (() => OrderSubject<TUnit> | null) | null = lazyValue(() => {
      let subject: OrderSubject<TUnit> | null = new Unit$OrderSubject(
        deployedIn,
        this,
        this.supply.derive(),
      );

      subject.supply.whenOff(_ => {
        subject = null;
        getSubject = null;
      });

      return subject;
    });

    this.host.workbench.instruct(async () => {
      const subject = getSubject?.();

      if (subject) {
        await deployedIn.run(async () => {
          try {
            await instruction(subject);
          } catch (error) {
            this.host.log.error(`Instructions for ${this.unit} rejected`, error);
            subject.supply.off(error);
          }
        });
      }
    });
  }

  deployTo(formation: Formation): void {
    this.host.log.warn(`${this.unit} can not be deployed to ${formation} outside the order`);
  }

}
