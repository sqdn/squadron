import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { OrderTest } from '../testing';
import { UnitContext } from '../unit';
import { Formation } from './formation';
import { FormationContext } from './formation-context';

describe('FormationContext', () => {
  beforeEach(() => {
    OrderTest.setup();
  });
  afterEach(() => {
    OrderTest.reset();
  });

  it('is available in creator context', () => {
    const context = OrderTest.createdIn.get(FormationContext);

    expect(context.hub).toBe(OrderTest.hub);
    expect(context.formation).toBe(OrderTest.formation);
    expect(context.unit).toBe(OrderTest.formation);
    expect(Object.is(context.unit.createdIn, OrderTest.createdIn)).toBe(true);
  });
  it('is available during formation deployment', async () => {
    const formation = OrderTest.formation;
    const orderFormation = OrderTest.createdIn.get(Formation);
    let context!: FormationContext;

    await OrderTest.run(async () => {
      formation.instruct(subject => subject.execute(ctx => {
          context = ctx as any;
        }));

      await OrderTest.evaluate();
    });

    expect(context.hub).toBe(OrderTest.hub);
    expect(context.formation).toBe(orderFormation);
    expect(context.unit).toBe(context.formation);
    expect(context).toBe(context.get(FormationContext));
    expect(context).toBe(context.get(UnitContext));
  });

  describe('toString', () => {
    it('provides string representation', () => {
      expect(String(FormationContext)).toBe('[FormationContext]');
    });
  });
});
