import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { asis } from '@proc7ts/primitives';
import { fileURLToPath } from 'url';
import { UnitLogger } from '../common';
import { Formation } from '../formation';
import { OrderPromulgator } from '../order';
import { OrderTest } from '../testing';
import { Unit } from './unit';

describe('Unit', () => {

  class TestUnit extends Unit {
  }

  let test: OrderTest;

  beforeEach(() => {
    test = OrderTest.setup();
  });
  afterEach(() => {
    test.reset();
  });

  describe('tag', () => {
    it('is empty by default', () => {
      expect(new TestUnit().tag).toBe('');
    });
    it('can be specified', () => {
      expect(new TestUnit({ tag: 'test' }).tag).toBe('test');
    });
  });

  describe('uid', () => {
    it('is unique to each unit instantiation location', () => {

      const unit1 = createUnit();
      const unit2 = createUnit();

      expect(unit1.uid).not.toBe(unit2.uid);
    });
    it('is the same for the same instantiation location', () => {

      const units: TestUnit[] = [];

      for (let i = 0; i < 2; ++i) {
        units.push(createUnit());
      }

      const [unit1, unit2] = units;

      expect(unit1.uid).toBe(unit2.uid);
    });
    it('is unique for different tags and the same instantiation location', () => {

      const units: TestUnit[] = [];

      for (let i = 0; i < 2; ++i) {
        units.push(createUnit({ tag: String(i) }));
      }

      const [unit1, unit2] = units;

      expect(unit1.uid).not.toBe(unit2.uid);
    });
  });

  describe('toString', () => {
    it('reflects unit type, UID, and origin', () => {

      const unit = createUnit();
      const filePath = fileURLToPath(import.meta.url);
      const pattern = new RegExp(`^TestUnit...${unit.uid.slice(-7)}\\((.+)\\)$`);

      expect(unit.toString()).toMatch(pattern);

      const location = pattern.exec(unit.toString())![1];

      expect(location).toContain(filePath);
      expect(location).toMatch(/.*:\d+:\d+$/);
    });
    it('reflects unit tag', () => {

      const unit = createUnit({ tag: 'test' });
      const filePath = fileURLToPath(import.meta.url);
      const pattern = new RegExp(`^TestUnit...${unit.uid.slice(-7)}\\((.+)\\)$`);

      expect(unit.toString()).toMatch(pattern);

      const location = pattern.exec(unit.toString())![1];

      expect(location).toContain(filePath);
      expect(location).toMatch(/.*:\d+:\d+:test$/);
    });
  });

  describe('order', () => {
    it('promulgates the order', async () => {

      const promulgator: OrderPromulgator<TestUnit> = jest.fn();
      const unit = createUnit();

      unit.order(promulgator);
      test.formation.deploy(unit);

      await test.executeOrder();

      expect(promulgator).toHaveBeenCalledWith(expect.objectContaining({
        formation: test.formation,
        unit,
      }));
    });
    it('does not promulgates the order when disabled', async () => {

      const promulgator: OrderPromulgator<TestUnit> = jest.fn();
      const unit = createUnit();

      unit.order(promulgator);
      test.formation.deploy(unit);
      unit.off();

      await test.executeOrder();

      expect(promulgator).not.toHaveBeenCalled();
    });
    it('does not promulgates the order when not deployed', async () => {

      const promulgator: OrderPromulgator<TestUnit> = jest.fn();
      const unit = createUnit();

      unit.order(promulgator);

      await test.executeOrder();

      expect(promulgator).not.toHaveBeenCalled();
    });
    it('does not promulgates the order when deployed to another formation', async () => {

      const formation2 = new Formation({ tag: 'other' });
      const promulgator: OrderPromulgator<TestUnit> = jest.fn();
      const unit = createUnit();

      unit.order(promulgator);
      formation2.deploy(unit);

      await test.executeOrder();

      expect(promulgator).not.toHaveBeenCalled();
    });
    it('does not promulgates the order to disabled formation', async () => {

      const promulgator: OrderPromulgator<TestUnit> = jest.fn();
      const unit = createUnit();

      unit.order(promulgator);
      test.formation.deploy(unit);
      test.formation.off();

      await test.executeOrder();

      expect(promulgator).not.toHaveBeenCalled();
      expect(await unit.supply.whenDone()).toBeUndefined();
    });
    it('cuts unit supply off when promulgation fails', async () => {

      const logger = {
        error: jest.fn<void, any[]>(),
      } as Partial<UnitLogger> as UnitLogger;

      test.registry.provide({ a: UnitLogger, is: logger });

      const error = new Error('test');
      const promulgator: OrderPromulgator<TestUnit> = jest.fn(() => {
        throw error;
      });
      const unit = createUnit();

      unit.order(promulgator);
      test.formation.deploy(unit);

      await test.executeOrder();

      expect(await unit.supply.whenDone().catch(asis)).toBe(error);
      expect(logger.error).toHaveBeenCalledWith(`Failed to promulgate the orders for ${unit}`, error);
    });
  });

  function createUnit(init?: Unit.Init): TestUnit {
    return new TestUnit(init);
  }

});
