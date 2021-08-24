import { CxEntry, cxSingle } from '@proc7ts/context-values';
import { Logger } from '@proc7ts/logger';
import Order from '@sqdn/order';
import { Formation } from '../formation';
import { Unit } from '../unit';
import { Unit$Backend } from '../unit/unit.backend.impl';
import { Unit$Deployment } from '../unit/unit.deployment.impl';
import { Unit$Evaluator } from '../unit/unit.evaluator.impl';
import { Unit$Host } from '../unit/unit.host.impl';
import { Formation$Host } from './formation.host';
import { Order$Workbench } from './order.workbench';

const Order$Evaluator$perContext: CxEntry.Definer<Order$Evaluator> = (/*#__PURE__*/ cxSingle({
  byDefault: target => new Order$Evaluator(target.get(Order.entry)),
}));

export class Order$Evaluator implements Unit$Host {

  static perContext(target: CxEntry.Target<Order$Evaluator>): CxEntry.Definition<Order$Evaluator> {
    return Order$Evaluator$perContext(target);
  }

  static toString(): string {
    return '[Order:Evaluator]';
  }

  readonly host: Formation$Host;
  readonly #evaluators = new Map<string, Unit$Evaluator<any>>();

  constructor(readonly order: Order) {
    this.host = order.get(Formation$Host);
  }

  get workbench(): Order$Workbench {
    return this.host.workbench;
  }

  get log(): Logger {
    return this.order.get(Logger);
  }

  unitDeployment<TUnit extends Unit>(unit: TUnit): Unit$Deployment<TUnit> {
    return this.host.unitDeployment(unit);
  }

  deploy(formation: Formation, unit: Unit): void {
    this.host.deploy(formation, unit);
  }

  evalUnit<TUnit extends Unit>(unit: TUnit): Unit$Backend<TUnit> {

    let evaluator = this.#evaluators.get(unit.uid);

    if (!evaluator) {
      evaluator = new Unit$Evaluator<TUnit>(this, unit);
      this.#evaluators.set(unit.uid, evaluator);
      this.host.putUnit(unit);
    }

    return evaluator.backend;
  }

}
