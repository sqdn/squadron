import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { OrderTest } from '../testing';
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

      const formation = new Formation();

      expect(formation.asFormation).toBe(formation);
    });
  });

  describe('toString', () => {
    it('provides string representation', () => {
      expect(String(Formation)).toBe('[Formation]');
    });
  });
});
