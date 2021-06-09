import Order from '@sqdn/order';
import { OrderExecutor } from '../impl';
import { Unit } from '../unit';

export class Formation extends Unit {

  deploy(unit: Unit): void {
    Order.get(OrderExecutor).deploy(unit, this);
  }

}
