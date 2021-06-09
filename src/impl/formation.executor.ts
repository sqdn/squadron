import { Supply } from '@proc7ts/supply';
import { Formation } from '../formation';
import { Unit } from '../unit';
import { Order$Executor } from './order.executor';

export const Formation$Executor__symbol = (/*#__PURE__*/ Symbol('Formation.executor'));

export class Formation$Executor {

  readonly supply = new Supply();
  private readonly _deployments = new Set<string>();

  constructor(
      private readonly _executor: Order$Executor,
      readonly formation: Formation,
  ) {
  }

  deploy(unit: Unit): void {
    this._deployments.add(unit.uid);

    if (this._executor.currentFormation().uid === this.formation.uid) {
      this._executor.evaluate();
      this._executor.unit(unit).deployTo(this);
    }
  }

}
