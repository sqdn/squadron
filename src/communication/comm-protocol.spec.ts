import { describe, expect, it } from '@jest/globals';
import { CommProtocol } from './comm-protocol';

describe('CommProtocol', () => {
  describe('toString', () => {
    it('provides string representation', () => {
      expect(String(CommProtocol)).toBe('[CommProtocol]');
    });
  });
});
