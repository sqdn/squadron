import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { Formation } from '../formation';
import { OrderTest } from '../testing';
import { OrderUnits } from './order-units';
import { Unit } from './unit';

describe('OrderUnits', () => {

  beforeEach(() => {
    OrderTest.setup();
  });
  afterEach(() => {
    OrderTest.reset();
  });

  describe('unitByUid', () => {
    it('returns existing unit', () => {

      const unit = new Unit();
      const orderUnits = OrderTest.order.get(OrderUnits);

      expect(orderUnits.unitByUid(unit.uid, Unit)).toBe(unit);
    });
    it('upgrades compatible existing unit', () => {

      class TestUnit1 extends Unit {}
      class TestUnit2 extends TestUnit1 {}

      const unit = new TestUnit1();
      const orderUnits = OrderTest.order.get(OrderUnits);

      expect(orderUnits.unitByUid(unit.uid, TestUnit2)).toBeInstanceOf(TestUnit2);
    });
    it('fails if existing unit is not of requested type', () => {

      class TestUnit1 extends Unit {}
      class TestUnit2 extends Unit {}

      const unit = new TestUnit1();
      const orderUnits = OrderTest.order.get(OrderUnits);

      expect(() => orderUnits.unitByUid(unit.uid, TestUnit2)).toThrow(`${unit} is not a TestUnit2`);
    });
    it('constructs missing unit of requested type', () => {

      const orderUnits = OrderTest.order.get(OrderUnits);
      const unit = orderUnits.unitByUid('test', Formation);

      expect(unit).toBeInstanceOf(Formation);
      expect(orderUnits.unitByUid(unit.uid, Formation)).toBe(unit);
    });
  });

  describe('toString', () => {
    it('provides string representation', () => {
      expect(String(OrderUnits)).toBe('[OrderUnits]');
    });
  });
});
