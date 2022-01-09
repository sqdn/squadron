import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { noop } from '@proc7ts/primitives';
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

    let orderUnits: OrderUnits;

    beforeEach(() => {
      orderUnits = OrderTest.createdIn.get(OrderUnits);
    });

    it('returns existing unit', () => {

      const unit = OrderTest.run(() => new Unit());

      expect(orderUnits.unitByUid(unit.uid, Unit)).toBe(unit);
    });
    it('fails if existing unit is not compatible', () => {

      class TestUnit1 extends Unit {}

      class TestUnit2 extends Unit {}

      const unit = OrderTest.run(() => new TestUnit1());

      expect(() => orderUnits.unitByUid(unit.uid, TestUnit2)).toThrow(new TypeError(`${unit} is not a TestUnit2`));
    });
    it('upgrades compatible reference-only unit', () => {

      class TestUnit1 extends Unit {}

      class TestUnit2 extends TestUnit1 {}

      const unit = OrderTest.run(() => new TestUnit1());

      expect(orderUnits.unitByUid(unit.uid, TestUnit2)).toBeInstanceOf(TestUnit2);
    });
    it('does not upgrade compatible unit with instructions', () => {

      class TestUnit1 extends Unit {}

      class TestUnit2 extends TestUnit1 {}

      const unit = OrderTest.run(() => {

        const unit = new TestUnit1();

        unit.instruct(noop);

        return unit;
      });

      expect(() => orderUnits.unitByUid(unit.uid, TestUnit2)).toThrow(new TypeError(`${unit} is not a TestUnit2`));
    });
    it('does not upgrade compatible deployed unit', () => {

      class TestUnit1 extends Unit {}

      class TestUnit2 extends TestUnit1 {}

      const unit = OrderTest.run(() => new TestUnit1());

      OrderTest.formation.deploy(unit);

      expect(() => orderUnits.unitByUid(unit.uid, TestUnit2)).toThrow(new TypeError(`${unit} is not a TestUnit2`));
    });
    it('constructs missing unit of requested type', () => {

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
