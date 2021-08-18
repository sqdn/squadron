import { noop } from '@proc7ts/primitives';
import { Formation } from '../formation';
import { Order$Evaluator } from '../impl';
import { OrderInstruction, OrderSubject } from '../order';
import { Unit } from './unit';
import { Unit$Backend, Unit$Backend__symbol, Unit$rejectOrder } from './unit.backend.impl';
import { Unit$Id__symbol } from './unit.id.impl';
import { Unit$OrderSubject } from './unit.order-subject.impl';

export class Unit$Evaluator<TUnit extends Unit> extends Unit$Backend<TUnit, Order$Evaluator> {

  readonly #instructions: OrderInstruction<TUnit>[] = [];
  #deliver = this.#doDeliver;

  instruct(instruction: OrderInstruction<TUnit>): void {
    this.#instructions.push(instruction);
  }

  deployTo(formation: Formation): void {
    this.supply.needs(formation);

    const { host } = this;

    let subject: OrderSubject<TUnit> | null = new Unit$OrderSubject(
        host.unitDeployment(this.unit),
        this.supply.derive(),
    );

    const instruct = (instruction: OrderInstruction<TUnit>): void => {
      host.workbench.accept(async () => {
        if (subject) {
          try {
            await instruction(subject);
          } catch (error) {
            this.supply.off(error);
            host.log.error(`Instructions for ${this.unit} rejected`, error);
          }
        }
      });
    };

    if (!this.supply.isOff) {
      for (const instruction of this.#instructions) {
        instruct(instruction);
      }
      this.#instructions.length = 0;
      this.instruct = instruct;
      this.host.deliver(() => this.#deliver());
    }

    this.supply.whenOff(() => {
      this.instruct = Unit$rejectOrder;
      this.#deliver = noop; // Do not deliver withdrawn unit.
      this.#instructions.length = 0;
      subject = null;
    });
  }

  #doDeliver(): void {

    const deployment = this.host.host.unitDeployment(this.unit);

    // Reuse the same `Unit$Id` instance to potentially free some memory.
    this.unit[Unit$Id__symbol] = deployment.unit[Unit$Id__symbol];

    // Replace unit evaluator with unit deployment.
    this.unit[Unit$Backend__symbol] = deployment;

    // Evaluator depends on deployment from now on.
    this.supply.needs(deployment.supply);
  }

}
