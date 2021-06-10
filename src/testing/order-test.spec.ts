import { afterEach, describe, expect, it } from '@jest/globals';
import { SingleContextKey } from '@proc7ts/context-values';
import { Formation } from '../formation';
import { OrderTest } from './order-test';

describe('OrderTest', () => {

  afterEach(() => {
    OrderTest.reset();
  });

  describe('registry', () => {
    it('sets up the test automatically', () => {

      const key = new SingleContextKey<string>('test');

      OrderTest.registry.provide({ a: key, is: 'test value' });

      expect(OrderTest.order.get(key)).toBe('test value');
    });
  });

  describe('formation', () => {
    it('sets up the test automatically', () => {
      expect(OrderTest.formation.tag).toBe('test');
      expect(OrderTest.formation).toBe(OrderTest.order.get(Formation));
    });
  });

  describe('setup', () => {
    it('sets up the test', () => {

      const test = OrderTest.setup();

      expect(test.registry).toBe(OrderTest.registry);
      expect(test.order).toBe(OrderTest.order);
      expect(test.formation).toBe(OrderTest.formation);
      expect(test.executeOrder).toBe(OrderTest.executeOrder);
      expect(test.reset).toBe(OrderTest.reset);
    });
  });
});
