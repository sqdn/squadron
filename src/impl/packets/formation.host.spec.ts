import { describe, expect, it } from '@jest/globals';
import { Formation$Host } from '../formation.host';

describe('Formation$Host', () => {
  describe('toString', () => {
    it('provides string representation', () => {
      expect(String(Formation$Host)).toBe('[Formation:Host]');
    });
  });
});
