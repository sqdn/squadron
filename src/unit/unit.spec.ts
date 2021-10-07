import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { cxConstAsset } from '@proc7ts/context-builder';
import { Logger, processingLogger } from '@proc7ts/logger';
import { asis, newPromiseResolver } from '@proc7ts/primitives';
import { Supply } from '@proc7ts/supply';
import { dueLogZ, zlogINFO, ZLogLevel } from '@run-z/log-z';
import { fileURLToPath } from 'url';
import { Formation } from '../formation';
import { OrderInstruction } from '../order';
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
    OrderTest.reset();
  });

  describe('asFormation', () => {
    it('is `undefined`', () => {
      expect(new TestUnit().asFormation).toBeUndefined();
    });
  });

  describe('order', () => {
    it('equals to original order', () => {

      const unit = new TestUnit();

      expect(unit.order).toBe(test.order);
      expect(unit.order).toBe(OrderTest.order);

      OrderTest.reset();
      expect(unit.order).not.toBe(OrderTest.order);
    });
  });

  describe('uid', () => {
    it('is unique to each source code fragment where the unit has been created', () => {

      const unit1 = new TestUnit();
      const unit2 = new TestUnit();

      expect(unit1.uid).not.toBe(unit2.uid);
    });
    it('is the same for the units created by the same source code fragment', () => {

      const units: TestUnit[] = [];

      for (let i = 0; i < 2; ++i) {
        units.push(new TestUnit());
      }

      const [unit1, unit2] = units;

      expect(unit1.uid).toBe(unit2.uid);
    });
    it('is unique for the units created by the same source code fragment with different tags', () => {

      const units: TestUnit[] = [];

      for (let i = 0; i < 2; ++i) {
        units.push(new TestUnit({ tag: String(i) }));
      }

      const [unit1, unit2] = units;

      expect(unit1.uid).not.toBe(unit2.uid);
    });
  });

  describe('supply', () => {
    it('is the same for units with the same UID', () => {

      const unit1 = new TestUnit();
      const unit2 = new TestUnit({ id: unit1.uid });

      expect(unit1.supply).toBe(unit2.supply);
    });
  });

  describe('sourceLink', () => {
    it('reflects fragment of source code', () => {

      const unit = new TestUnit();
      const filePath = fileURLToPath(import.meta.url);

      expect(unit.sourceLink).toContain(filePath);
      expect(unit.sourceLink).toMatch(/:\d+:\d+$/);
    });
  });

  describe('toLog', () => {
    it('logs unit string representation by default', () => {

      const logger: Logger = {
        info: jest.fn(),
      } as Partial<Logger> as Logger;
      const unit = new TestUnit({ tag: 'custom' });

      processingLogger(logger).info(unit);

      expect(logger.info).toHaveBeenCalledWith(String(unit));
    });
    it('expands to unit details', () => {

      const unit = new TestUnit({ tag: 'custom' });

      expect(dueLogZ({
        line: [unit],
        zLevel: ZLogLevel.Info,
        zDetails: {},
      }).zMessage).toEqual({
        level: ZLogLevel.Info,
        line: [],
        details: {
          unit: {
            name: 'TestUnit',
            uid: unit.uid,
            src: unit.sourceLink,
          },
        },
      });
    });
    it('does not expand to unit details on input', () => {

      const unit = new TestUnit({ tag: 'custom' });

      expect(zlogINFO(unit)).toEqual({
        level: ZLogLevel.Info,
        line: [unit],
        details: {},
      });
    });
    it('converts to string representation if not in the leading position', () => {

      const unit = new TestUnit({ tag: 'custom' });

      expect(dueLogZ({
        line: ['prefix', unit],
        zLevel: ZLogLevel.Info,
        zDetails: {},
      }).zMessage).toEqual({
        level: ZLogLevel.Info,
        line: ['prefix', String(unit)],
        details: {},
      });
    });
  });

  describe('toString', () => {
    it('reflects unit type, UID, and source code fragment', () => {

      const unit = new TestUnit();
      const filePath = fileURLToPath(import.meta.url);
      const pattern = new RegExp(`^\\[TestUnit ...${unit.uid.slice(-7)}\\((.+)\\)\\]$`);

      expect(unit.toString()).toMatch(pattern);

      const sourceLink = pattern.exec(unit.toString())![1];

      expect(sourceLink).toContain(filePath);
      expect(sourceLink).toMatch(/.*:\d+:\d+$/);
    });
    it('reflects unit tag', () => {

      const unit = new TestUnit({ tag: 'test' });
      const filePath = fileURLToPath(import.meta.url);
      const pattern = new RegExp(`^\\[TestUnit test...${unit.uid.slice(-7)}\\((.+)\\)\\]$`);

      expect(unit.toString()).toMatch(pattern);

      const sourceLink = pattern.exec(unit.toString())![1];

      expect(sourceLink).toContain(filePath);
      expect(sourceLink).toMatch(/.*:\d+:\d+$/);
    });
    it('reflects short custom id', () => {

      const unit = new TestUnit({ id: '0123456789' });
      const pattern = new RegExp(`^\\[TestUnit 0123456789\\((.+)\\)\\]$`);

      expect(unit.toString()).toMatch(pattern);
    });
    it('reflects short custom id and tag', () => {

      const unit = new TestUnit({ id: '123456789', tag: 'test' });
      const pattern = new RegExp(`^\\[TestUnit test@123456789\\((.+)\\)\\]$`);

      expect(unit.toString()).toMatch(pattern);
    });
    it('reflects custom uid with custom id', () => {

      const unit = new TestUnit({ id: 'test@123456789' });
      const pattern = new RegExp(`^\\[TestUnit test@123456789\\((.+)\\)\\]$`);

      expect(unit.toString()).toMatch(pattern);
    });
    it('reflects custom uid with short id and tag', () => {

      const unit = new TestUnit({ id: 'custom@123456789', tag: 'test' });
      const pattern = new RegExp(`^\\[TestUnit test@custom@123456789\\((.+)\\)\\]$`);

      expect(unit.toString()).toMatch(pattern);
    });
    it('reflects long custom id', () => {

      const unit = new TestUnit({ id: '0123456789a' });
      const pattern = new RegExp(`^\\[TestUnit ...456789a\\((.+)\\)\\]$`);

      expect(unit.toString()).toMatch(pattern);
    });
    it('reflects long custom id and tag', () => {

      const unit = new TestUnit({ id: '0123456789', tag: 'test' });
      const pattern = new RegExp(`^\\[TestUnit test...3456789\\((.+)\\)\\]$`);

      expect(unit.toString()).toMatch(pattern);
    });
    it('reflects custom uid with long id', () => {

      const unit = new TestUnit({ id: 'test@0123456789' });
      const pattern = new RegExp(`^\\[TestUnit test...3456789\\((.+)\\)\\]$`);

      expect(unit.toString()).toMatch(pattern);
    });
    it('reflects custom uid with long id and tag', () => {

      const unit = new TestUnit({ id: 'custom@0123456789', tag: 'test' });
      const pattern = new RegExp(`^\\[TestUnit test@custom...3456789\\((.+)\\)\\]$`);

      expect(unit.toString()).toMatch(pattern);
    });
  });

  describe('instruct', () => {
    it('records instruction', async () => {

      const instruction: OrderInstruction<TestUnit> = jest.fn();
      const unit = new TestUnit();

      unit.instruct(instruction);
      test.formation.deploy(unit);

      await test.evaluate();

      expect(instruction).toHaveBeenCalledWith(expect.objectContaining({
        formation: test.formation,
        unit,
      }));
    });
    it('records instruction of already deployed unit', async () => {

      const instruction: OrderInstruction<TestUnit> = jest.fn();
      const unit = new TestUnit();

      test.formation.deploy(unit);
      unit.instruct(instruction);

      await test.evaluate();

      expect(instruction).toHaveBeenCalledWith(expect.objectContaining({
        formation: test.formation,
        unit,
      }));
    });
    it('does not record instruction when unit withdrawn', async () => {

      const instruction: OrderInstruction<TestUnit> = jest.fn();
      const unit = new TestUnit();

      unit.instruct(instruction);
      test.formation.deploy(unit);
      unit.off();

      await test.evaluate();

      expect(instruction).not.toHaveBeenCalled();
    });
    it('ignores instructions right after unit withdrawal', async () => {

      const unit = new TestUnit();
      const instruction: OrderInstruction<TestUnit> = jest.fn();

      test.formation.deploy(unit);
      unit.instruct(() => {
        unit.supply.off();
        unit.instruct(instruction);
      });
      await test.evaluate();

      expect(instruction).not.toHaveBeenCalled();
    });
    it('ignores instruction when not deployed', async () => {

      const instruction: OrderInstruction<TestUnit> = jest.fn();
      const unit = new TestUnit();

      unit.instruct(instruction);

      await test.evaluate();

      expect(instruction).not.toHaveBeenCalled();
    });
    it('ignores instruction when deployed to another formation', async () => {

      const formation2 = new Formation({ tag: 'other' });
      const instruction: OrderInstruction<TestUnit> = jest.fn();
      const unit = new TestUnit();

      unit.instruct(instruction);
      formation2.deploy(unit);

      await test.evaluate();

      expect(instruction).not.toHaveBeenCalled();
    });
    it('ignores instruction to disabled formation', async () => {

      const instruction: OrderInstruction<TestUnit> = jest.fn();
      const unit = new TestUnit();

      unit.instruct(instruction);
      test.formation.deploy(unit);
      test.formation.off();

      await test.evaluate();

      expect(instruction).not.toHaveBeenCalled();
      expect(await unit.supply.whenDone()).toBeUndefined();
    });
    it('withdraws the unit when instruction rejected', async () => {

      const logger = {
        error: jest.fn<void, any[]>(),
      } as Partial<Logger> as Logger;

      test.formationBuilder.provide(cxConstAsset(Logger, logger));

      const error = new Error('test');
      const instruction: OrderInstruction<TestUnit> = jest.fn(() => {
        throw error;
      });
      const unit = new TestUnit();

      unit.instruct(instruction);
      test.formation.deploy(unit);

      await test.evaluate();

      expect(await unit.supply.whenDone().catch(asis)).toBe(error);
      expect(logger.error).toHaveBeenCalledWith(`Instructions for ${unit} rejected`, error);
    });
    it('handles recurrent order evaluation', async () => {

      const unit = new TestUnit();
      const recurrent = newPromiseResolver();

      unit.instruct(() => {
        recurrent.resolve(test.evaluate());
      });
      test.formation.deploy(unit);

      let evaluated: unknown;

      test.evaluate().then(() => evaluated = true).catch(error => evaluated = error);

      await recurrent.promise();
      expect(evaluated).toBe(true);
    });
    it('allows to deploy during deployment', async () => {

      const unit1 = new TestUnit();
      const unit2 = new TestUnit();
      const instruction2: OrderInstruction = jest.fn();

      unit1.instruct(subject => {
        subject.execute(({ formation }) => {
          formation.deploy(unit2);
        });
      });
      test.formation.deploy(unit1);
      unit2.instruct(instruction2);

      await test.evaluate();

      expect(instruction2).toHaveBeenCalled();
    });

    describe('when instructed after order evaluation', () => {
      it('does not withdraw the unit when instructions rejected', async () => {

        const logger = {
          error: jest.fn<void, any[]>(),
        } as Partial<Logger> as Logger;

        test.formationBuilder.provide(cxConstAsset(Logger, logger));

        const error = new Error('test');
        const unit = new TestUnit();

        test.formation.deploy(unit);

        await test.evaluate();

        let subjectSupply!: Supply;
        const instruction: OrderInstruction<TestUnit> = jest.fn(({ supply }) => {
          subjectSupply = supply;
          throw error;
        });

        unit.instruct(instruction);

        await test.evaluate();

        expect(unit.supply.isOff).toBe(false);
        expect(await subjectSupply.whenDone().catch(asis)).toBe(error);
        expect(logger.error).toHaveBeenCalledWith(`Instructions for ${unit} rejected`, error);
      });
      it('does not apply instruction to withdrawn unit', async () => {

        const unit = new TestUnit();

        test.formation.deploy(unit);
        await test.evaluate();

        unit.off();

        const instruction: OrderInstruction<TestUnit> = jest.fn();

        unit.instruct(instruction);

        await test.evaluate();

        expect(instruction).not.toHaveBeenCalled();
      });
      it('does not apply instruction to not deployed unit', async () => {

        const unit = new TestUnit();

        await test.evaluate();

        const instruction: OrderInstruction<TestUnit> = jest.fn();

        unit.instruct(instruction);

        await test.evaluate();

        expect(instruction).not.toHaveBeenCalled();
      });
    });
  });
});
