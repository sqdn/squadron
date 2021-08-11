import { describe, expect, it } from '@jest/globals';
import { UnitLocator } from './unit-locator';

describe('UnitLocator', () => {
  describe('toString', () => {
    it('provides string representation', () => {
      expect(String(UnitLocator)).toBe('[UnitLocator]');
    });
  });
});
