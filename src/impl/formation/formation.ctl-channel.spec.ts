import { describe, expect, it } from '@jest/globals';
import { Formation$CtlChannel } from './formation.ctl-channel';

describe('Formation$CtlChannel', () => {
  describe('toString', () => {
    it('provides string representation', () => {
      expect(String(Formation$CtlChannel)).toBe('[Formation:CtlChannel]');
    });
  });
});
