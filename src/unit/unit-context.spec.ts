import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import Order from '@sqdn/order';
import { Formation, FormationContext } from '../formation';
import { OrderTest } from '../testing';
import { Unit } from './unit';
import { UnitContext } from './unit-context';

describe('UnitContext', () => {

  beforeEach(() => {
    OrderTest.setup();
  });
  afterEach(() => {
    OrderTest.reset();
  });

  it('is available in order', () => {

    const context = Order.get(UnitContext);

    expect(context.formation).toBe(OrderTest.formation);
    expect(context.unit).toBe(OrderTest.formation);
    expect(context).toBe(Order.get(FormationContext));
  });
  it('is available during unit execution', async () => {

    const orderFormation = Order.get(Formation);
    const unit = new Unit({ tag: 'test' });
    let context!: UnitContext;

    unit.order(({ execute }) => execute(ctx => {
      context = ctx;
    }));

    OrderTest.formation.deploy(unit);

    await OrderTest.evaluate();
    expect(context.formation).toBe(orderFormation);
    expect(context.unit).toBe(unit);
    expect(context).toBe(context.get(UnitContext));
    expect(context).not.toBe(context.get(FormationContext));
  });
});
