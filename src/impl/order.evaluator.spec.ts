import { describe, expect, it } from '@jest/globals';
import { Order$Evaluator } from './order.evaluator';

describe('Order$Evaluator', () => {
  describe('toString', () => {
    it('provides string representation', () => {
      expect(String(Order$Evaluator)).toBe('[Order:Evaluator]');
    });
  });
});
