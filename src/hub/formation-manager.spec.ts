import { describe, expect, it } from '@jest/globals';
import { FormationManager } from './formation-manager';

describe('FormationManager', () => {
  describe('toString', () => {
    it('provides string representation', () => {
      expect(String(FormationManager)).toBe('[FormationManager]');
    });
  });
});
