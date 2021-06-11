import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import Order from '@sqdn/order';
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

    const context = Order.get(FormationContext);

    expect(context.formation).toBe(OrderTest.formation);
    expect(context.unit).toBe(OrderTest.formation);
  });
  it('is available during formation execution', async () => {

    const formation = OrderTest.formation;
    let context!: FormationContext;

    formation.order(({ execute }) => execute(ctx => {
      context = ctx;
    }));

    await OrderTest.executeOrder();

    expect(context.formation).toBe(Order.get(Formation));
    expect(context.unit).toBe(context.formation);
    expect(context).toBe(context.get(FormationContext));
    expect(context).toBe(context.get(UnitContext));
  });
});
