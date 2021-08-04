import { afterEach, describe, expect, it } from '@jest/globals';
import { cxConstAsset } from '@proc7ts/context-builder';
import { CxEntry, cxSingle } from '@proc7ts/context-values';
import { Formation } from '../formation';
import { OrderTest } from './order-test';

describe('OrderTest', () => {

  afterEach(() => {
    OrderTest.reset();
  });

  describe('registry', () => {
    it('sets up the test automatically', () => {

      const entry: CxEntry<string> = { perContext: cxSingle(), toString: () => '[CxEntry test]' };

      OrderTest.cxBuilder.provide(cxConstAsset(entry, 'test value'));

      expect(OrderTest.order.get(entry)).toBe('test value');
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

      expect(test.cxBuilder).toBe(OrderTest.cxBuilder);
      expect(test.order).toBe(OrderTest.order);
      expect(test.formation).toBe(OrderTest.formation);
      expect(test.formationCxBuilder).toBe(OrderTest.formationCxBuilder);
      expect(test.evaluate).toBe(OrderTest.evaluate);
      expect(test.evaluate).toBe(OrderTest.evaluate);
      expect(test.reset).toBe(OrderTest.reset);
    });
  });
});
