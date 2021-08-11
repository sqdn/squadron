import { describe, expect, it } from '@jest/globals';
import { Formation$LaunchData } from './formation.launch-data';

describe('Formation$LaunchData', () => {
  describe('toString', () => {
    it('provides string representation', () => {
      expect(String(Formation$LaunchData)).toBe('[Formation:LaunchData]');
    });
  });
});
