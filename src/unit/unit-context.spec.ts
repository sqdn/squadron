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
    const context = OrderTest.createdIn.get(UnitContext);

    expect(context.hub).toBe(OrderTest.hub);
    expect(context.formation).toBe(OrderTest.formation);
    expect(context.unit).toBe(OrderTest.formation);
    expect(context).toBe(OrderTest.createdIn.get(FormationContext));
  });
  it('is available during unit deployment', async () => {
    const orderFormation = OrderTest.createdIn.get(Formation);
    let context!: UnitContext;
    const unit = await OrderTest.run(async () => {
      const unit = new Unit({ tag: 'test' });

      unit.instruct(subject => subject.execute(ctx => {
          context = ctx;
        }));

      OrderTest.formation.deploy(unit);
      await OrderTest.evaluate();

      return unit;
    });

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
