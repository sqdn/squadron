import { noop } from '@proc7ts/primitives';
import { Supply, SupplyPeer } from '@proc7ts/supply';
import { OrderPromulgation, OrderPromulgator } from '../order';
import { Unit } from '../unit';
import { Formation$Executor } from './formation.executor';
import { Order$Executor } from './order.executor';

export const Unit$Executor__symbol = (/*#__PURE__*/ Symbol('Unit.executor'));

export class Unit$Executor<TUnit extends Unit> implements SupplyPeer {

  private _promulgation: OrderPromulgation<TUnit> | null = null;
  readonly supply = new Supply();

  constructor(
      private readonly _executor: Order$Executor,
      readonly unit: TUnit,
  ) {
  }

  order(promulgator: OrderPromulgator<TUnit>): void {
    this._executor.workbench
        .work(this._executor.promulgationStage)
        .run(async () => {
          await this._promulgate(promulgator);
        })
        .catch(noop);
  }

  deployTo(formation: Formation$Executor): void {
    this.supply.needs(formation.supply);
    this._promulgation = {
      formation: formation.formation,
      unit: this.unit,
      supply: this.supply,
    };
    this.supply.whenOff(() => {
      this._promulgation = null;
    });
  }

  private async _promulgate(promulgator: OrderPromulgator<TUnit>): Promise<void> {

    const promulgation = this._promulgation;

    if (promulgation) {
      try {
        await promulgator(promulgation);
      } catch (error) {
        this.supply.off(error);
        this._executor.log.error(`Failed to promulgate the orders for ${this.unit}`, error);
      }
    }
  }

}
