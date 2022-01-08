import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { OrderTest } from '../testing';
import { Unit } from '../unit';
import { CommError } from './comm-error';

describe('CommError', () => {
  beforeEach(() => {
    OrderTest.setup();
  });
  afterEach(() => {
    OrderTest.reset();
  });

  let unit: Unit;

  beforeEach(() => {
    unit = OrderTest.run(() => new Unit());
  });

  describe('unit', () => {
    it('contains target unit', () => {
      expect(new CommError(unit).unit).toBe(unit);
    });
  });

  describe('reason', () => {
    it('is undefined by default', () => {

      const error = new CommError(unit, 'Error');

      expect(error.reason).toBeUndefined();
      expect(String(error)).toBe(`CommError: Error`);
    });
    it('reflects failure reason', () => {

      const reason = new Error('Reason');
      const error = new CommError(unit, undefined, reason);

      expect(error.reason).toBe(reason);
      expect(String(error)).toBe(`CommError: Error communicating with ${unit}. Error: Reason`);
    });
  });
});
