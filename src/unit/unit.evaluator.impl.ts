import { noop } from '@proc7ts/primitives';
import { Formation } from '../formation';
import { Order$Evaluator } from '../impl';
import { OrderContext, OrderInstruction, OrderSubject } from '../order';
import { Unit } from './unit';
import { UnitStatus } from './unit-status';
import { Unit$Backend, Unit$Backend__symbol, Unit$rejectOrder } from './unit.backend.impl';
import { Unit$Id__symbol } from './unit.id.impl';
import { Unit$OrderSubject } from './unit.order-subject.impl';

export class Unit$Evaluator<TUnit extends Unit> extends Unit$Backend<TUnit, Order$Evaluator> {

  readonly #instructions: (readonly [
    instruction: OrderInstruction<TUnit>,
    deployedIn: OrderContext,
  ])[] = [];

  backend: Unit$Backend<TUnit> = this;
  #deliver = this.#doDeliver;

  instruct(instruction: OrderInstruction<TUnit>): void {
    this.#instructions.push([instruction, OrderContext.current()]);
  }

  deployTo(formation: Formation): void {
    this.supply.needs(formation);

    const { host } = this;
    const deployment = host.deploymentOf(this.unit);
    const subjects = new Map<OrderContext, Unit$OrderSubject<TUnit> | null>();
    const getSubject = (deployedIn: OrderContext): OrderSubject<TUnit> | null => {
      let subject = subjects.get(deployedIn);

      if (subject === undefined) {
        subject = new Unit$OrderSubject(deployedIn, deployment, this.supply.derive());
        subjects.set(deployedIn, subject);
        subject.supply.whenOff(() => {
          subjects.set(deployedIn, null);
          subject = null;
        });
      }

      return subject;
    };

    let numInstructions = 0;
    const instruct = (instruction: OrderInstruction<TUnit>, deployedIn: OrderContext): void => {
      ++numInstructions;

      host.workbench.instruct(async () => {
        const subject = getSubject(deployedIn);

        if (subject) {
          await deployedIn.run(async () => {
            try {
              await instruction(subject);
              if (!--numInstructions) {
                deployment.setStatus(UnitStatus.Instructed);
              }
            } catch (error) {
              this.supply.off(error);
              host.log.error(`Instructions for ${this.unit} rejected`, error);
            }
          });
        }
      });
    };

    if (!this.supply.isOff) {
      for (const [instruction, deployedIn] of this.#instructions) {
        instruct(instruction, deployedIn);
      }
      this.#instructions.length = 0;

      this.instruct = instruction => {
        instruct(instruction, OrderContext.current());
      };

      this.host.workbench.ready(() => this.#deliver());
    }

    this.supply.whenOff(() => {
      this.instruct = Unit$rejectOrder;
      this.#deliver = noop; // Do not deliver withdrawn unit.
      this.#instructions.length = 0;
    });
  }

  #doDeliver(): void {
    const deployment = this.host.host.deploymentOf(this.unit);

    // Reuse the same `Unit$Id` instance to potentially free some memory.
    this.unit[Unit$Id__symbol] = deployment.unit[Unit$Id__symbol];

    // Replace unit evaluator with unit deployment.
    this.unit[Unit$Backend__symbol] = this.backend = deployment;

    // Evaluator depends on deployment from now on.
    this.supply.needs(deployment.supply);

    // The unit is ready.
    deployment.setStatus(UnitStatus.Ready);
  }

}
