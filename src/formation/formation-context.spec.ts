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

  it('is available in order', () => {

    const context = OrderTest.order.get(FormationContext);

    expect(context.formation).toBe(OrderTest.formation);
    expect(context.unit).toBe(OrderTest.formation);
  });
  it('is available during formation execution', async () => {

    const formation = OrderTest.formation;
    const orderFormation = OrderTest.order.get(Formation);
    let context!: FormationContext;

    formation.instruct(({ execute }) => execute(ctx => {
      context = ctx;
    }));

    await OrderTest.evaluate();

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
