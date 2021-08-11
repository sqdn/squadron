import { describe, expect, it } from '@jest/globals';
import { Communicator } from './communicator';

describe('Communicator', () => {
  describe('toString', () => {
    it('provides string representation', () => {
      expect(String(Communicator)).toBe('[Communicator]');
    });
  });
});
