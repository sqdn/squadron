import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { cxConstAsset } from '@proc7ts/context-builder';
import { CxEntry, cxRecent } from '@proc7ts/context-values';
import { Logger } from '@proc7ts/logger';
import { asis } from '@proc7ts/primitives';
import { Supply } from '@proc7ts/supply';
import { Mock } from 'jest-mock';
import { OrderTest } from '../testing';
import { Unit, UnitContext } from '../unit';
import { OrderSubject } from './order-subject';
import { OrderTask } from './order-task';

describe('OrderSubject', () => {

  let test: OrderTest;

  beforeEach(() => {
    test = OrderTest.setup();
  });
  afterEach(() => {
    OrderTest.reset();
  });

  describe('hub', () => {
    it('refers the central hub', async () => {

      const unit = new Unit();
      let unitSubject!: OrderSubject;

      unit.instruct(subject => {
        unitSubject = subject;
      });

      OrderTest.formation.deploy(unit);

      await OrderTest.evaluate();

      expect(unitSubject.hub).toBe(OrderTest.hub);
    });
  });

  describe('formation', () => {
    it('refers the target formation', async () => {

      const unit = new Unit();
      let unitSubject!: OrderSubject;

      unit.instruct(subject => {
        unitSubject = subject;
      });

      OrderTest.formation.deploy(unit);

      await OrderTest.evaluate();

      expect(unitSubject.formation).toBe(OrderTest.formation);
    });
  });

  describe('unit', () => {
    it('refers the unit', async () => {

      const unit = new Unit();
      let unitSubject!: OrderSubject;

      unit.instruct(subject => {
        unitSubject = subject;
      });

      OrderTest.formation.deploy(unit);

      await OrderTest.evaluate();

      expect(unitSubject.unit).toBe(unit);
    });
  });

  describe('provide', () => {
    it('provides unit context value', async () => {

      const entry: CxEntry<string> = {
        perContext: cxRecent({ byDefault: () => 'default' }),
        toString: () => '[CxEntry test]',
      };
      const unit = new Unit();
      let unitSubject!: OrderSubject;
      let unitContext!: UnitContext;

      unit.instruct(subject => {
        unitSubject = subject;
        unitContext = subject.context;
        subject.provide(cxConstAsset(entry, 'provided'));
      });

      OrderTest.formation.deploy(unit);

      await OrderTest.evaluate();

      expect(unitContext.get(entry)).toBe('provided');
      expect(unitSubject.get(entry)).toBe('provided');

      unitSubject.supply.off();
      expect(unitContext.get(entry)).toBe('default');
      expect(unitSubject.get(entry)).toBe('default');
    });
  });

  describe('execute', () => {
    it('executes the task', async () => {

      const task: OrderTask<Unit> = jest.fn();
      const unit = new Unit();

      unit.instruct(subject => {
        subject.execute(task);
      });
      OrderTest.formation.deploy(unit);

      await OrderTest.evaluate();

      expect(task).toHaveBeenCalledTimes(1);
      expect(unit.supply.isOff).toBe(false);
    });

    it('executes the task added after order evaluation', async () => {

      const unit = new Unit();

      test.formation.deploy(unit);

      await test.evaluate();

      const task: Mock<void, [UnitContext<Unit>]> = jest.fn();

      await new Promise<void>(resolve => {
        unit.instruct(subject => {
          subject.execute(task.mockImplementation(() => resolve()));
        });
      });

      expect(task).toHaveBeenCalledTimes(1);
      expect(unit.supply.isOff).toBe(false);
    });
    it('withdraws the subject if task execution fails', async () => {

      const logger = {
        error: jest.fn<void, any[]>(),
      } as Partial<Logger> as Logger;

      test.formationBuilder.provide(cxConstAsset(Logger, logger));

      const error = new Error('test');
      const task: OrderTask<Unit> = jest.fn(() => {
        throw error;
      });
      const unit = new Unit();
      let unitSubject!: OrderSubject;

      unit.instruct(subject => {
        unitSubject = subject;
        subject.execute(task);
      });
      test.formation.deploy(unit);

      await test.evaluate();

      expect(task).toHaveBeenCalledTimes(1);
      expect(unitSubject.supply.isOff).toBe(true);
      expect(unit.supply.isOff).toBe(false);
      expect(await unitSubject.supply.whenDone().catch(asis)).toBe(error);
      expect(logger.error).toHaveBeenCalledWith(`Failed to execute ${unit} task`, error);
    });

    describe('after order evaluation', () => {
      it('executes the task after order evaluation', async () => {

        const unit = new Unit();
        let exec!: OrderSubject<Unit>['execute'];

        unit.instruct(subject => {
          exec = subject.execute.bind(subject);
        });
        test.formation.deploy(unit);
        await test.evaluate();

        const task: Mock<void, [UnitContext<Unit>]> = jest.fn();

        await new Promise<void>(resolve => {
          exec(task.mockImplementation(() => resolve()));
        });

        expect(task).toHaveBeenCalledTimes(1);
        expect(unit.supply.isOff).toBe(false);
      });
      it('does not withdraw the unit if task execution fails', async () => {

        const logger = {
          error: jest.fn<void, any[]>(),
        } as Partial<Logger> as Logger;

        test.formationBuilder.provide(cxConstAsset(Logger, logger));

        const unit = new Unit();
        let exec!: OrderSubject<Unit>['execute'];
        let subjectSupply!: Supply;

        unit.instruct(subject => {
          exec = subject.execute.bind(subject);
          subjectSupply = subject.supply;
        });
        test.formation.deploy(unit);
        await test.evaluate();

        const error = new Error('Test');
        const task = jest.fn<void, [UnitContext<Unit>]>(() => {
          throw error;
        });

        exec(task);
        await test.evaluate();

        expect(task).toHaveBeenCalledTimes(1);
        expect(unit.supply.isOff).toBe(false);

        expect(logger.error).toHaveBeenCalledWith(`Failed to execute ${unit} task`, error);
        expect(subjectSupply.isOff).toBe(true);
        expect(await subjectSupply.whenDone().catch(asis)).toBe(error);
      });
    });
  });

  describe('for the task created after order evaluation', () => {
    it('executes the task', async () => {

      const unit = new Unit();

      test.formation.deploy(unit);

      await test.evaluate();

      const task: Mock<void, [UnitContext<Unit>]> = jest.fn();

      await new Promise<void>(resolve => {
        unit.instruct(subject => {
          subject.execute(task.mockImplementation(() => resolve()));
        });
      });

      expect(task).toHaveBeenCalledTimes(1);
      expect(unit.supply.isOff).toBe(false);
    });
    it('does not withdraw the unit if task execution fails', async () => {

      const logger = {
        error: jest.fn<void, any[]>(),
      } as Partial<Logger> as Logger;

      test.formationBuilder.provide(cxConstAsset(Logger, logger));

      const unit = new Unit();

      test.formation.deploy(unit);

      await test.evaluate();

      const error = new Error('Test');
      const task = jest.fn<void, [UnitContext<Unit>]>(() => {
        throw error;
      });
      let subjectSupply!: Supply;

      unit.instruct(subject => {
        subjectSupply = subject.supply;
        subject.execute(task);
      });

      await test.evaluate();

      expect(task).toHaveBeenCalledTimes(1);
      expect(unit.supply.isOff).toBe(false);

      expect(logger.error).toHaveBeenCalledWith(`Failed to execute ${unit} task`, error);
      expect(subjectSupply.isOff).toBe(true);
      expect(await subjectSupply.whenDone().catch(asis)).toBe(error);
    });
  });
});
