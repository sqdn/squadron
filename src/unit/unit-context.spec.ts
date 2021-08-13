import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
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

    const context = OrderTest.order.get(UnitContext);

    expect(context.hub).toBe(OrderTest.hub);
    expect(context.formation).toBe(OrderTest.formation);
    expect(context.unit).toBe(OrderTest.formation);
    expect(context).toBe(OrderTest.order.get(FormationContext));
  });
  it('is available during unit execution', async () => {

    const orderFormation = OrderTest.order.get(Formation);
    const unit = new Unit({ tag: 'test' });
    let context!: UnitContext;

    unit.instruct(({ execute }) => execute(ctx => {
      context = ctx;
    }));

    OrderTest.formation.deploy(unit);

    await OrderTest.evaluate();
    expect(context.hub).toBe(OrderTest.hub);
    expect(context.formation).toBe(orderFormation);
    expect(context.unit).toBe(unit);
    expect(context).toBe(context.get(UnitContext));
    expect(context).not.toBe(context.get(FormationContext));
  });

  describe('toString', () => {
    it('provides string representation', () => {
      expect(String(UnitContext)).toBe('[UnitContext]');
    });
  });
});
