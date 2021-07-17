import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { cxConstAsset } from '@proc7ts/context-builder';
import { Logger } from '@proc7ts/logger';
import { asis } from '@proc7ts/primitives';
import { Supply } from '@proc7ts/supply';
import { fileURLToPath } from 'url';
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

      const unit1 = new TestUnit();
      const unit2 = new TestUnit();

      expect(unit1.uid).not.toBe(unit2.uid);
    });
    it('is the same for the same instantiation location', () => {

      const units: TestUnit[] = [];

      for (let i = 0; i < 2; ++i) {
        units.push(new TestUnit());
      }

      const [unit1, unit2] = units;

      expect(unit1.uid).toBe(unit2.uid);
    });
    it('is unique for different tags and the same instantiation location', () => {

      const units: TestUnit[] = [];

      for (let i = 0; i < 2; ++i) {
        units.push(new TestUnit({ tag: String(i) }));
      }

      const [unit1, unit2] = units;

      expect(unit1.uid).not.toBe(unit2.uid);
    });
  });

  describe('toString', () => {
    it('reflects unit type, UID, and origin', () => {

      const unit = new TestUnit();
      const filePath = fileURLToPath(import.meta.url);
      const pattern = new RegExp(`^TestUnit...${unit.uid.slice(-7)}\\((.+)\\)$`);

      expect(unit.toString()).toMatch(pattern);

      const location = pattern.exec(unit.toString())![1];

      expect(location).toContain(filePath);
      expect(location).toMatch(/.*:\d+:\d+$/);
    });
    it('reflects unit tag', () => {

      const unit = new TestUnit({ tag: 'test' });
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
      const unit = new TestUnit();

      unit.order(promulgator);
      test.formation.deploy(unit);

      await test.evaluate();

      expect(promulgator).toHaveBeenCalledWith(expect.objectContaining({
        formation: test.formation,
        unit,
      }));
    });
    it('promulgates the order of already deployed unit', async () => {

      const promulgator: OrderPromulgator<TestUnit> = jest.fn();
      const unit = new TestUnit();

      test.formation.deploy(unit);
      unit.order(promulgator);

      await test.evaluate();

      expect(promulgator).toHaveBeenCalledWith(expect.objectContaining({
        formation: test.formation,
        unit,
      }));
    });
    it('does not promulgate the order when unit withdrawn', async () => {

      const promulgator: OrderPromulgator<TestUnit> = jest.fn();
      const unit = new TestUnit();

      unit.order(promulgator);
      test.formation.deploy(unit);
      unit.off();

      await test.evaluate();

      expect(promulgator).not.toHaveBeenCalled();
    });
    it('is not promulgated right after unit withdrawal', async () => {

      const unit = new TestUnit();
      const promulgator: OrderPromulgator<TestUnit> = jest.fn();

      test.formation.deploy(unit);
      unit.order(({ supply }) => {
        supply.off();
        unit.order(promulgator);
      });
      await test.evaluate();

      expect(promulgator).not.toHaveBeenCalled();
    });
    it('does not promulgate the order when not deployed', async () => {

      const promulgator: OrderPromulgator<TestUnit> = jest.fn();
      const unit = new TestUnit();

      unit.order(promulgator);

      await test.evaluate();

      expect(promulgator).not.toHaveBeenCalled();
    });
    it('does not promulgate the order when deployed to another formation', async () => {

      const formation2 = new Formation({ tag: 'other' });
      const promulgator: OrderPromulgator<TestUnit> = jest.fn();
      const unit = new TestUnit();

      unit.order(promulgator);
      formation2.deploy(unit);

      await test.evaluate();

      expect(promulgator).not.toHaveBeenCalled();
    });
    it('does not promulgate the order to disabled formation', async () => {

      const promulgator: OrderPromulgator<TestUnit> = jest.fn();
      const unit = new TestUnit();

      unit.order(promulgator);
      test.formation.deploy(unit);
      test.formation.off();

      await test.evaluate();

      expect(promulgator).not.toHaveBeenCalled();
      expect(await unit.supply.whenDone()).toBeUndefined();
    });
    it('withdraws the unit when promulgation fails', async () => {

      const logger = {
        error: jest.fn<void, any[]>(),
      } as Partial<Logger> as Logger;

      test.formationCxBuilder.provide(cxConstAsset(Logger, logger));

      const error = new Error('test');
      const promulgator: OrderPromulgator<TestUnit> = jest.fn(() => {
        throw error;
      });
      const unit = new TestUnit();

      unit.order(promulgator);
      test.formation.deploy(unit);

      await test.evaluate();

      expect(await unit.supply.whenDone().catch(asis)).toBe(error);
      expect(logger.error).toHaveBeenCalledWith(`Failed to promulgate the orders for ${unit}`, error);
    });

    describe('for promulgation after order evaluation', () => {
      it('does not withdraw the unit when promulgation fails', async () => {

        const logger = {
          error: jest.fn<void, any[]>(),
        } as Partial<Logger> as Logger;

        test.formationCxBuilder.provide(cxConstAsset(Logger, logger));

        const error = new Error('test');
        const unit = new TestUnit();

        test.formation.deploy(unit);

        await test.evaluate();

        let promulgationSupply!: Supply;
        const promulgator: OrderPromulgator<TestUnit> = jest.fn(({ supply }) => {
          promulgationSupply = supply;
          throw error;
        });
        unit.order(promulgator);

        await test.evaluate();

        expect(unit.supply.isOff).toBe(false);
        expect(await promulgationSupply.whenDone().catch(asis)).toBe(error);
        expect(logger.error).toHaveBeenCalledWith(`Failed to promulgate the orders for ${unit}`, error);
      });
      it('is not executed for withdrawn unit', async () => {

        const unit = new TestUnit();

        test.formation.deploy(unit);
        await test.evaluate();

        unit.off();

        const promulgator: OrderPromulgator<TestUnit> = jest.fn();

        unit.order(promulgator);

        await test.evaluate();

        expect(promulgator).not.toHaveBeenCalled();
      });
      it('is not executed for not deployed unit', async () => {

        const unit = new TestUnit();

        await test.evaluate();

        const promulgator: OrderPromulgator<TestUnit> = jest.fn();

        unit.order(promulgator);

        await test.evaluate();

        expect(promulgator).not.toHaveBeenCalled();
      });
    });
  });

  describe('deploy', () => {
    describe('after order evaluation', () => {
      it('does not deploy the unit', async () => {

        const logger = {
          warn: jest.fn<void, any[]>(),
        } as Partial<Logger> as Logger;

        test.formationCxBuilder.provide(cxConstAsset(Logger, logger));

        const unit = new Unit();

        test.formation.deploy(unit);
        await test.evaluate();

        test.formation.deploy(unit);
        await test.evaluate();

        expect(logger.warn).toHaveBeenCalledWith(`${unit} can not be deployed to ${test.formation} outside the order`);
      });
    });
  });
});
