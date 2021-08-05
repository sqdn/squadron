import { describe, expect, it } from '@jest/globals';
import { CommMethod } from './comm-method';

describe('CommMethod', () => {
  describe('toString', () => {
    it('provides string representation', () => {
      expect(String(CommMethod)).toBe('[CommMethod]');
    });
  });
});
