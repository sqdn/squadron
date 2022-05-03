import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { cxConstAsset } from '@proc7ts/context-builder';
import { Logger } from '@proc7ts/logger';
import { OrderTest } from '../testing';
import { Unit } from '../unit';
import { Formation } from './formation';

describe('Formation', () => {

  beforeEach(() => {
    OrderTest.setup();
  });
  afterEach(() => {
    OrderTest.reset();
  });

  describe('asFormation', () => {
    it('refers itself', () => {

      const formation = OrderTest.run(() => new Formation());

      expect(formation.asFormation).toBe(formation);
    });
  });

  describe('deploy', () => {
    describe('after order evaluation', () => {
      it('does not deploy the unit', async () => {

        const logger = {
          warn: jest.fn<(...message: unknown[]) => void>(),
        } as Partial<Logger> as Logger;

        OrderTest.formationBuilder.provide(cxConstAsset(Logger, logger));

        const unit = OrderTest.run(() => new Unit());

        OrderTest.formation.deploy(unit);
        await OrderTest.evaluate();

        OrderTest.formation.deploy(unit);
        await OrderTest.evaluate();

        expect(logger.warn).toHaveBeenCalledWith(
            `${unit} can not be deployed to ${OrderTest.formation} outside the order`,
        );
      });
    });
  });

  describe('toString', () => {
    it('provides string representation', () => {
      expect(String(Formation)).toBe('[Formation]');
    });
  });
});
