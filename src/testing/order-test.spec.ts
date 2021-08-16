import { afterEach, describe, expect, it } from '@jest/globals';
import { cxConstAsset } from '@proc7ts/context-builder';
import { CxEntry, cxSingle } from '@proc7ts/context-values';
import Order from '@sqdn/order';
import { Formation, FormationContext } from '../formation';
import { OrderTest } from './order-test';

describe('OrderTest', () => {

  afterEach(() => {
    OrderTest.reset();
  });

  describe('orderBuilder', () => {
    it('sets up the test automatically', () => {

      const entry: CxEntry<string> = { perContext: cxSingle(), toString: () => '[CxEntry test]' };

      OrderTest.orderBuilder.provide(cxConstAsset(entry, 'test value'));

      expect(OrderTest.order.get(entry)).toBe('test value');
    });
  });

  describe('hub', () => {
    it('sets up the test automatically', () => {
      expect(OrderTest.hub).toBe(OrderTest.order.get(FormationContext).hub);
    });
  });

  describe('formation', () => {
    it('sets up the test automatically', () => {
      expect(OrderTest.formation).toBe(OrderTest.order.get(Formation));
    });
  });

  describe('setup', () => {
    it('sets up the test', () => {

      const test = OrderTest.setup();

      expect(test.hub).toBe(OrderTest.hub);
      expect(test.formation).toBe(OrderTest.formation);
      expect(test.formationBuilder).toBe(OrderTest.formationBuilder);
      expect(test.order).toBe(OrderTest.order);
      expect(test.order.current).toBe(OrderTest.order);
      expect(test.orderBuilder).toBe(OrderTest.orderBuilder);
      expect(test.supply).toBe(OrderTest.supply);
    });
  });

  describe('reset', () => {
    it('makes order inactive', () => {
      OrderTest.setup();
      expect(Order.current.active).toBe(true);

      OrderTest.reset();
      expect(Order.current.active).toBe(false);

      OrderTest.reset();
      expect(Order.current.active).toBe(false);
    });
  });
});
