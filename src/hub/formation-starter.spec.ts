import { describe, expect, it } from '@jest/globals';
import { FormationStarter } from './formation-starter';

describe('FormationStarter', () => {
  describe('toString', () => {
    it('provides string representation', () => {
      expect(String(FormationStarter)).toBe('[FormationStarter]');
    });
  });
});
