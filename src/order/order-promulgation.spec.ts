import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { cxConstAsset } from '@proc7ts/context-builder';
import { Logger } from '@proc7ts/logger';
import { asis } from '@proc7ts/primitives';
import { Supply } from '@proc7ts/supply';
import { Mock } from 'jest-mock';
import { OrderTest } from '../testing';
import { Unit, UnitContext, UnitTask } from '../unit';
import { OrderPromulgation } from './order-promulgation';

describe('OrderPromulgation', () => {

  let test: OrderTest;

  beforeEach(() => {
    test = OrderTest.setup();
  });
  afterEach(() => {
    test.reset();
  });

  describe('execute', () => {
    it('executes the task', async () => {

      const task: UnitTask<Unit> = jest.fn();
      const unit = new Unit();

      unit.order(({ execute }) => {
        execute(task);
      });
      test.formation.deploy(unit);

      await test.evaluate();

      expect(task).toHaveBeenCalledTimes(1);
      expect(unit.supply.isOff).toBe(false);
    });

    it('executes the task promulgated after order evaluation', async () => {

      const unit = new Unit();

      test.formation.deploy(unit);

      await test.evaluate();

      const task: Mock<void, [UnitContext<Unit>]> = jest.fn();

      await new Promise<void>(resolve => {
        unit.order(({ execute }) => {
          execute(task.mockImplementation(() => resolve()));
        });
      });

      expect(task).toHaveBeenCalledTimes(1);
      expect(unit.supply.isOff).toBe(false);
    });
    it('withdraws the unit if task execution fails', async () => {

      const logger = {
        error: jest.fn<void, any[]>(),
      } as Partial<Logger> as Logger;

      test.formationCxBuilder.provide(cxConstAsset(Logger, logger));

      const error = new Error('test');
      const task: UnitTask<Unit> = jest.fn(() => {
        throw error;
      });
      const unit = new Unit();

      unit.order(({ execute }) => {
        execute(task);
      });
      test.formation.deploy(unit);

      await test.evaluate();

      expect(task).toHaveBeenCalledTimes(1);
      expect(unit.supply.isOff).toBe(true);
      expect(await unit.supply.whenDone().catch(asis)).toBe(error);
      expect(logger.error).toHaveBeenCalledWith(`Failed to start ${unit}`, error);
    });

    describe('after order evaluation', () => {
      it('executes the task after order evaluation', async () => {

        const unit = new Unit();
        let exec!: OrderPromulgation<Unit>['execute'];

        unit.order(({ execute }) => {
          exec = execute;
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

        test.formationCxBuilder.provide(cxConstAsset(Logger, logger));

        const unit = new Unit();
        let exec!: OrderPromulgation<Unit>['execute'];
        let promulgationSupply!: Supply;

        unit.order(({ execute, supply }) => {
          exec = execute;
          promulgationSupply = supply;
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

        expect(logger.error).toHaveBeenCalledWith(`Failed to start ${unit}`, error);
        expect(promulgationSupply.isOff).toBe(true);
        expect(await promulgationSupply.whenDone().catch(asis)).toBe(error);
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
        unit.order(({ execute }) => {
          execute(task.mockImplementation(() => resolve()));
        });
      });

      expect(task).toHaveBeenCalledTimes(1);
      expect(unit.supply.isOff).toBe(false);
    });
    it('does not withdraw the unit if task execution fails', async () => {

      const logger = {
        error: jest.fn<void, any[]>(),
      } as Partial<Logger> as Logger;

      test.formationCxBuilder.provide(cxConstAsset(Logger, logger));

      const unit = new Unit();

      test.formation.deploy(unit);

      await test.evaluate();

      const error = new Error('Test');
      const task = jest.fn<void, [UnitContext<Unit>]>(() => {
        throw error;
      });
      let promulgationSupply!: Supply;

      unit.order(({ execute, supply }) => {
        promulgationSupply = supply;
        execute(task);
      });

      await test.evaluate();

      expect(task).toHaveBeenCalledTimes(1);
      expect(unit.supply.isOff).toBe(false);

      expect(logger.error).toHaveBeenCalledWith(`Failed to execute ${unit}`, error);
      expect(promulgationSupply.isOff).toBe(true);
      expect(await promulgationSupply.whenDone().catch(asis)).toBe(error);
    });
  });
});
