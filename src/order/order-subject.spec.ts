import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { cxConstAsset } from '@proc7ts/context-builder';
import { CxEntry, cxRecent } from '@proc7ts/context-values';
import { Logger } from '@proc7ts/logger';
import { asis } from '@proc7ts/primitives';
import { Supply } from '@proc7ts/supply';
import { Mock } from 'jest-mock';
import { FormationContext } from '../formation';
import { OrderTest } from '../testing';
import { Unit, UnitContext, UnitStatus } from '../unit';
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

  describe('context', () => {
    it('tracks unit status', async () => {

      const unit = new Unit();
      const statuses: UnitStatus[] = [];
      let instructionStatus1: UnitStatus | undefined;
      let instructionStatus2: UnitStatus | undefined;
      let taskStatus1: UnitStatus | undefined;
      let taskStatus2: UnitStatus | undefined;

      unit.instruct(async subject => {
        subject.context.readStatus(status => statuses.push(status));
        instructionStatus1 = await subject.context.readStatus;

        subject.execute(async context => {
          taskStatus1 = await context.readStatus;
        });
      });
      unit.instruct(async subject => {
        instructionStatus2 = await subject.context.readStatus;

        subject.execute(async context => {
          taskStatus2 = await context.readStatus;
        });
      });

      OrderTest.formation.deploy(unit);

      await OrderTest.evaluate();

      expect(instructionStatus1).toBe(UnitStatus.Available);
      expect(instructionStatus2).toBe(UnitStatus.Available);
      expect(taskStatus1).toBe(UnitStatus.Instructed);
      expect(taskStatus2).toBe(UnitStatus.Instructed);
      expect(statuses).toEqual([
        UnitStatus.Available,
        UnitStatus.Instructed,
        UnitStatus.Executed,
        UnitStatus.Ready,
      ]);
    });
    it('tracks formation status', async () => {

      const unit = new Unit();
      const statuses: UnitStatus[] = [];
      let instructionStatus1: UnitStatus | undefined;
      let instructionStatus2: UnitStatus | undefined;
      let taskStatus1: UnitStatus | undefined;
      let taskStatus2: UnitStatus | undefined;

      const fmnContext = OrderTest.formationBuilder.context;

      fmnContext.readStatus(status => statuses.push(status));
      unit.instruct(async subject => {
        instructionStatus1 = await fmnContext.readStatus;

        subject.execute(async () => {
          taskStatus1 = await fmnContext.readStatus;
        });
      });
      unit.instruct(async subject => {
        instructionStatus2 = await fmnContext.readStatus;

        subject.execute(async () => {
          taskStatus2 = await fmnContext.readStatus;
        });
      });

      OrderTest.formation.deploy(unit);

      await OrderTest.evaluate();

      expect(instructionStatus1).toBe(UnitStatus.Available);
      expect(instructionStatus2).toBe(UnitStatus.Available);
      expect(taskStatus1).toBe(UnitStatus.Instructed);
      expect(taskStatus2).toBe(UnitStatus.Instructed);
      expect(statuses).toEqual([
        UnitStatus.Available,
        UnitStatus.Instructed,
        UnitStatus.Executed,
        UnitStatus.Ready,
      ]);
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

  describe('perFormation', () => {
    it('provides formation context value', async () => {

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
        subject.perFormation(cxConstAsset(entry, 'provided'));
      });

      OrderTest.formation.deploy(unit);

      await OrderTest.evaluate();

      const formationContext = unitContext.get(FormationContext);

      expect(formationContext.get(entry)).toBe('provided');
      expect(unitContext.get(entry)).toBe('provided');
      expect(unitSubject.get(entry)).toBe('provided');

      unitSubject.supply.off();
      expect(formationContext.get(entry)).toBe('default');
      expect(unitContext.get(entry)).toBe('default');
      expect(unitSubject.get(entry)).toBe('default');
    });
  });

  describe('perOrder', () => {
    it('provides order value', async () => {

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
        subject.perOrder(cxConstAsset(entry, 'provided'));
      });

      OrderTest.formation.deploy(unit);

      await OrderTest.evaluate();

      const formationContext = unitContext.get(FormationContext);

      expect(OrderTest.order.get(entry)).toBe('provided');
      expect(formationContext.get(entry)).toBe('default');
      expect(unitContext.get(entry)).toBe('default');
      expect(unitSubject.get(entry)).toBe('default');

      unitSubject.supply.off();
      expect(OrderTest.order.get(entry)).toBe('default');
    });
  });

  describe('perUnit', () => {
    it('provides values for each unit', async () => {

      const entry: CxEntry<string> = {
        perContext: cxRecent({ byDefault: () => 'default' }),
        toString: () => '[CxEntry test]',
      };
      const unit1 = new Unit();
      let unitSubject1!: OrderSubject;
      let unitContext1!: UnitContext;

      unit1.instruct(subject => {
        unitSubject1 = subject;
        unitContext1 = subject.context;
        subject.perUnit(cxConstAsset(entry, 'provided'));
      });

      OrderTest.formation.deploy(unit1);

      const unit2 = new Unit();
      let unitSubject2!: OrderSubject;
      let unitContext2!: UnitContext;

      unit2.instruct(subject => {
        unitSubject2 = subject;
        unitContext2 = subject.context;
      });

      OrderTest.formation.deploy(unit2);

      await OrderTest.evaluate();

      const formationContext = unitContext1.get(FormationContext);

      expect(OrderTest.order.get(entry)).toBe('default');
      expect(formationContext.get(entry)).toBe('default');
      expect(unitContext1.get(entry)).toBe('provided');
      expect(unitSubject1.get(entry)).toBe('provided');
      expect(unitContext2.get(entry)).toBe('provided');
      expect(unitSubject2.get(entry)).toBe('provided');

      unitSubject1.supply.off();
      expect(unitContext1.get(entry)).toBe('default');
      expect(unitSubject1.get(entry)).toBe('default');
      expect(unitContext2.get(entry)).toBe('default');
      expect(unitSubject2.get(entry)).toBe('default');
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

      unit.instruct(subject => {
        subject.execute(task);
      });

      await test.evaluate();

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
    it('rejects the task for revoked subject', async () => {

      const logger = {
        warn: jest.fn<void, any[]>(),
      } as Partial<Logger> as Logger;

      test.formationBuilder.provide(cxConstAsset(Logger, logger));

      const error = new Error('test');
      const task: OrderTask<Unit> = jest.fn();
      const unit = new Unit();

      unit.instruct(subject => {
        subject.supply.off(error);
        subject.execute(task);
      });
      test.formation.deploy(unit);

      await test.evaluate();

      expect(task).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(`Task for ${unit} rejected`, error);
    });

    describe('after order evaluation', () => {
      it('executes the task after order evaluation', async () => {

        const unit = new Unit();
        let exec!: OrderSubject['execute'];

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
        let exec!: OrderSubject['execute'];
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

      unit.instruct(subject => {
        subject.execute(task);
      });

      await test.evaluate();

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
