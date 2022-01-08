import { afterEach, describe, expect, it } from '@jest/globals';
import { cxConstAsset } from '@proc7ts/context-builder';
import { CxEntry, cxSingle } from '@proc7ts/context-values';
import { Formation, FormationContext } from '../formation';
import { OrderTest } from './order-test';

describe('OrderTest', () => {

  afterEach(() => {
    OrderTest.reset();
  });

  describe('orderBuilder', () => {
    it('sets up the test automatically', () => {

      const entry: CxEntry<string> = { perContext: cxSingle(), toString: () => '[CxEntry test]' };

      OrderTest.builtBy.provide(cxConstAsset(entry, 'test value'));

      expect(OrderTest.createdIn.get(entry)).toBe('test value');
    });
  });

  describe('hub', () => {
    it('sets up the test automatically', () => {
      expect(OrderTest.hub).toBe(OrderTest.createdIn.get(FormationContext).hub);
    });
  });

  describe('formation', () => {
    it('sets up the test automatically', () => {
      expect(OrderTest.formation).toBe(OrderTest.createdIn.get(Formation));
    });
  });

  describe('setup', () => {
    it('sets up the test', () => {

      const test = OrderTest.setup();

      expect(test.hub).toBe(OrderTest.hub);
      expect(test.formation).toBe(OrderTest.formation);
      expect(test.formationBuilder).toBe(OrderTest.formationBuilder);
      expect(test.createdIn).toBe(OrderTest.createdIn);
      expect(test.builtBy).toBe(OrderTest.builtBy);
      expect(test.supply).toBe(OrderTest.supply);
    });
  });
});
