import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { cxConstAsset } from '@proc7ts/context-builder';
import { Logger, processingLogger } from '@proc7ts/logger';
import { asis, newPromiseResolver } from '@proc7ts/primitives';
import { Supply } from '@proc7ts/supply';
import { dueLogZ, zlogINFO, ZLogLevel } from '@run-z/log-z';
import { fileURLToPath } from 'node:url';
import { Formation } from '../formation';
import { OrderInstruction, OrderSubject } from '../order';
import { OrderTest } from '../testing';
import { Unit } from './unit';

describe('Unit', () => {
  class TestUnit extends Unit {}

  let test: OrderTest;

  beforeEach(() => {
    test = OrderTest.setup();
  });
  afterEach(() => {
    OrderTest.reset();
  });

  describe('asFormation', () => {
    it('is `undefined`', () => {
      const unit = test.run(() => new TestUnit());

      expect(unit.asFormation).toBeUndefined();
    });
  });

  describe('createdIn', () => {
    it('equals to original order', () => {
      const unit = test.run(() => new TestUnit());

      expect(unit.createdIn).toBe(test.createdIn);
      expect(unit.createdIn).toBe(OrderTest.createdIn);

      OrderTest.reset();
      expect(unit.createdIn).not.toBe(OrderTest.createdIn);
    });
  });

  describe('uid', () => {
    it('is unique to each source code fragment where the unit has been created', () => {
      const { unit1, unit2 } = test.run(() => {
        const unit1 = new TestUnit();
        const unit2 = new TestUnit();

        return { unit1, unit2 };
      });

      expect(unit1.uid).not.toBe(unit2.uid);
    });
    it('is the same for the units created by the same source code fragment', () => {
      const [unit1, unit2] = test.run(() => {
        const units: TestUnit[] = [];

        for (let i = 0; i < 2; ++i) {
          units.push(new TestUnit());
        }

        return units;
      });

      expect(unit1.uid).toBe(unit2.uid);
    });
    it('is unique for the units created by the same source code fragment with different tags', () => {
      const [unit1, unit2] = test.run(() => {
        const units: TestUnit[] = [];

        for (let i = 0; i < 2; ++i) {
          units.push(new TestUnit({ tag: String(i) }));
        }

        return units;
      });

      expect(unit1.uid).not.toBe(unit2.uid);
    });
  });

  describe('supply', () => {
    it('is the same for units with the same UID', () => {
      const { unit1, unit2 } = test.run(() => {
        const unit1 = new TestUnit();
        const unit2 = new TestUnit({ id: unit1.uid });

        return { unit1, unit2 };
      });

      expect(unit1.supply).toBe(unit2.supply);
    });
  });

  describe('sourceLink', () => {
    it('reflects fragment of source code', () => {
      const unit = test.run(() => new TestUnit());
      const filePath = fileURLToPath(import.meta.url);

      expect(unit.sourceLink).toContain(filePath);
      expect(unit.sourceLink).toMatch(/:\d+:\d+$/);
    });
    it('reflects fragment of source code with function call', () => {
      const unit = new TestUnit({ createdIn: test.formation.createdIn });
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
      const unit = test.run(() => new TestUnit({ tag: 'custom' }));

      processingLogger(logger).info(unit);

      expect(logger.info).toHaveBeenCalledWith(String(unit));
    });
    it('expands to unit details', () => {
      const unit = test.run(() => new TestUnit({ tag: 'custom' }));

      expect(
        dueLogZ({
          line: [unit],
          zLevel: ZLogLevel.Info,
          zDetails: {},
        }).zMessage,
      ).toEqual({
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
      const unit = test.run(() => new TestUnit({ tag: 'custom' }));

      expect(zlogINFO(unit)).toEqual({
        level: ZLogLevel.Info,
        line: [unit],
        details: {},
      });
    });
    it('converts to string representation if not in the leading position', () => {
      const unit = test.run(() => new TestUnit({ tag: 'custom' }));

      expect(
        dueLogZ({
          line: ['prefix', unit],
          zLevel: ZLogLevel.Info,
          zDetails: {},
        }).zMessage,
      ).toEqual({
        level: ZLogLevel.Info,
        line: ['prefix', String(unit)],
        details: {},
      });
    });
  });

  describe('toString', () => {
    it('reflects unit type, UID, and source code fragment', () => {
      const unit = test.run(() => new TestUnit());
      const filePath = fileURLToPath(import.meta.url);
      const pattern = new RegExp(`^\\[TestUnit ...${unit.uid.slice(-7)}\\((.+)\\)\\]$`);

      expect(unit.toString()).toMatch(pattern);

      const sourceLink = pattern.exec(unit.toString())![1];

      expect(sourceLink).toContain(filePath);
      expect(sourceLink).toMatch(/.*:\d+:\d+$/);
    });
    it('reflects unit tag', () => {
      const unit = test.run(() => new TestUnit({ tag: 'test' }));
      const filePath = fileURLToPath(import.meta.url);
      const pattern = new RegExp(`^\\[TestUnit test...${unit.uid.slice(-7)}\\((.+)\\)\\]$`);

      expect(unit.toString()).toMatch(pattern);

      const sourceLink = pattern.exec(unit.toString())![1];

      expect(sourceLink).toContain(filePath);
      expect(sourceLink).toMatch(/.*:\d+:\d+$/);
    });
    it('reflects short custom id', () => {
      const unit = test.run(() => new TestUnit({ id: '0123456789' }));
      const pattern = new RegExp(`^\\[TestUnit 0123456789\\((.+)\\)\\]$`);

      expect(unit.toString()).toMatch(pattern);
    });
    it('reflects short custom id and tag', () => {
      const unit = test.run(() => new TestUnit({ id: '123456789', tag: 'test' }));
      const pattern = new RegExp(`^\\[TestUnit test@123456789\\((.+)\\)\\]$`);

      expect(unit.toString()).toMatch(pattern);
    });
    it('reflects custom uid with custom id', () => {
      const unit = test.run(() => new TestUnit({ id: 'test@123456789' }));
      const pattern = new RegExp(`^\\[TestUnit test@123456789\\((.+)\\)\\]$`);

      expect(unit.toString()).toMatch(pattern);
    });
    it('reflects custom uid with short id and tag', () => {
      const unit = test.run(() => new TestUnit({ id: 'custom@123456789', tag: 'test' }));
      const pattern = new RegExp(`^\\[TestUnit test@custom@123456789\\((.+)\\)\\]$`);

      expect(unit.toString()).toMatch(pattern);
    });
    it('reflects long custom id', () => {
      const unit = test.run(() => new TestUnit({ id: '0123456789a' }));
      const pattern = new RegExp(`^\\[TestUnit ...456789a\\((.+)\\)\\]$`);

      expect(unit.toString()).toMatch(pattern);
    });
    it('reflects long custom id and tag', () => {
      const unit = test.run(() => new TestUnit({ id: '0123456789', tag: 'test' }));
      const pattern = new RegExp(`^\\[TestUnit test...3456789\\((.+)\\)\\]$`);

      expect(unit.toString()).toMatch(pattern);
    });
    it('reflects custom uid with long id', () => {
      const unit = test.run(() => new TestUnit({ id: 'test@0123456789' }));
      const pattern = new RegExp(`^\\[TestUnit test...3456789\\((.+)\\)\\]$`);

      expect(unit.toString()).toMatch(pattern);
    });
    it('reflects custom uid with long id and tag', () => {
      const unit = test.run(() => new TestUnit({ id: 'custom@0123456789', tag: 'test' }));
      const pattern = new RegExp(`^\\[TestUnit test@custom...3456789\\((.+)\\)\\]$`);

      expect(unit.toString()).toMatch(pattern);
    });
  });

  describe('instruct', () => {
    it('records instruction', async () => {
      const instruction = jest.fn<OrderInstruction<TestUnit>>();
      const unit = await test.run(async () => {
        const unit = new TestUnit();

        unit.instruct(instruction);
        test.formation.deploy(unit);

        await test.evaluate();

        return unit;
      });

      expect(instruction).toHaveBeenCalledWith(
        expect.objectContaining({
          formation: test.formation,
          unit,
        }) as unknown as OrderSubject<TestUnit>,
      );
    });
    it('records instruction of already deployed unit', async () => {
      const instruction = jest.fn<OrderInstruction<TestUnit>>();
      const unit = await test.run(async () => {
        const unit = test.run(() => new TestUnit());

        test.formation.deploy(unit);
        unit.instruct(instruction);

        await test.evaluate();

        return unit;
      });

      expect(instruction).toHaveBeenCalledWith(
        expect.objectContaining({
          formation: test.formation,
          unit,
        }) as unknown as OrderSubject<TestUnit>,
      );
    });
    it('does not record instruction when unit withdrawn', async () => {
      const instruction = jest.fn<OrderInstruction<TestUnit>>();

      await test.run(async () => {
        const unit = new TestUnit();

        unit.instruct(instruction);
        test.formation.deploy(unit);
        unit.off();

        await test.evaluate();
      });

      expect(instruction).not.toHaveBeenCalled();
    });
    it('ignores instructions right after unit withdrawal', async () => {
      const instruction = jest.fn<OrderInstruction<TestUnit>>();

      await test.run(async () => {
        const unit = new TestUnit();

        test.formation.deploy(unit);
        unit.instruct(() => {
          unit.supply.off();
          unit.instruct(instruction);
        });

        await test.evaluate();
      });

      expect(instruction).not.toHaveBeenCalled();
    });
    it('ignores instruction when not deployed', async () => {
      const instruction = jest.fn<OrderInstruction<TestUnit>>();

      await test.run(async () => {
        const unit = new TestUnit();

        unit.instruct(instruction);

        await test.evaluate();
      });

      expect(instruction).not.toHaveBeenCalled();
    });
    it('ignores instruction when deployed to another formation', async () => {
      const instruction = jest.fn<OrderInstruction<TestUnit>>();

      await test.run(async () => {
        const formation2 = new Formation({ tag: 'other' });
        const unit = new TestUnit();

        unit.instruct(instruction);
        formation2.deploy(unit);

        await test.evaluate();
      });

      expect(instruction).not.toHaveBeenCalled();
    });
    it('ignores instruction to disabled formation', async () => {
      const instruction = jest.fn<OrderInstruction<TestUnit>>();

      const unit = await test.run(async () => {
        const unit = new TestUnit();

        unit.instruct(instruction);
        test.formation.deploy(unit);
        test.formation.off();

        await test.evaluate();

        return unit;
      });

      expect(instruction).not.toHaveBeenCalled();
      expect(await unit.supply.whenDone()).toBeUndefined();
    });
    it('withdraws the unit when instruction rejected', async () => {
      const logger = {
        error: jest.fn<(...message: unknown[]) => void>(),
      } as Partial<Logger> as Logger;

      test.formationBuilder.provide(cxConstAsset(Logger, logger));

      const error = new Error('test');
      const instruction = jest.fn<OrderInstruction<TestUnit>>(() => {
        throw error;
      });

      const unit = await test.run(async () => {
        const unit = new TestUnit();

        unit.instruct(instruction);
        test.formation.deploy(unit);

        await test.evaluate();

        return unit;
      });

      expect(await unit.supply.whenDone().catch(asis)).toBe(error);
      expect(logger.error).toHaveBeenCalledWith(`Instructions for ${unit} rejected`, error);
    });
    it('handles recurrent order evaluation', async () => {
      const recurrent = newPromiseResolver();
      let evaluated: unknown;

      test.run(() => {
        const unit = new TestUnit();

        unit.instruct(() => {
          recurrent.resolve(test.evaluate());
        });
        test.formation.deploy(unit);

        test
          .evaluate()
          .then(() => (evaluated = true))
          .catch(error => (evaluated = error));
      });

      await recurrent.promise();
      expect(evaluated).toBe(true);
    });
    it('allows to deploy during deployment', async () => {
      const instruction2 = jest.fn<OrderInstruction>();

      await test.run(async () => {
        const unit1 = new TestUnit();
        const unit2 = new TestUnit();

        unit1.instruct(subject => {
          subject.execute(({ formation }) => {
            formation.deploy(unit2);
          });
        });
        test.formation.deploy(unit1);
        unit2.instruct(instruction2);

        await test.evaluate();
      });

      expect(instruction2).toHaveBeenCalled();
    });

    describe('when instructed after order evaluation', () => {
      it('does not withdraw the unit when instructions rejected', async () => {
        const logger = {
          error: jest.fn<(...message: unknown[]) => void>(),
        } as Partial<Logger> as Logger;

        test.formationBuilder.provide(cxConstAsset(Logger, logger));

        const error = new Error('test');
        let subjectSupply!: Supply;
        const instruction = jest.fn<OrderInstruction<TestUnit>>(({ supply }) => {
          subjectSupply = supply;
          throw error;
        });

        const unit = await test.run(async () => {
          const unit = new TestUnit();

          test.formation.deploy(unit);

          await test.evaluate();

          unit.instruct(instruction);

          await test.evaluate();

          return unit;
        });

        expect(unit.supply.isOff).toBe(false);
        expect(await subjectSupply.whenDone().catch(asis)).toBe(error);
        expect(logger.error).toHaveBeenCalledWith(`Instructions for ${unit} rejected`, error);
      });
      it('does not apply instruction to withdrawn unit', async () => {
        const instruction = jest.fn<OrderInstruction<TestUnit>>();

        await test.run(async () => {
          const unit = new TestUnit();

          test.formation.deploy(unit);
          await test.evaluate();

          unit.off();
          unit.instruct(instruction);

          await test.evaluate();
        });

        expect(instruction).not.toHaveBeenCalled();
      });
      it('does not apply instruction to not deployed unit', async () => {
        const instruction = jest.fn<OrderInstruction<TestUnit>>();

        await test.run(async () => {
          const unit = new TestUnit();

          await test.evaluate();

          unit.instruct(instruction);

          await test.evaluate();
        });

        expect(instruction).not.toHaveBeenCalled();
      });
    });
  });
});
