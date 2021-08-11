import { describe, expect, it } from '@jest/globals';
import { CommProcessor } from './comm-processor';

describe('CommProcessor', () => {
  describe('toString', () => {
    it('provides string representation', () => {
      expect(String(CommProcessor)).toBe('[CommProcessor]');
    });
  });
});
