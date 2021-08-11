import { describe, expect, it } from '@jest/globals';
import { CommLinker } from './comm-linker';

describe('CommLinker', () => {
  describe('toString', () => {
    it('provides string representation', () => {
      expect(String(CommLinker)).toBe('[CommLinker]');
    });
  });
});
