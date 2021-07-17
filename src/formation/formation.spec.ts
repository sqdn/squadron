import { describe, expect, it } from '@jest/globals';
import { Formation } from './formation';

describe('Formation', () => {
  describe('toString', () => {
    it('provides string representation', () => {
      expect(String(Formation)).toBe('[Formation]');
    });
  });
});
