import { describe, expect, it } from '@jest/globals';
import { FormationToHubCommChannel } from './formation-to-hub.comm-channel';

describe('FormationToHubCommChannel', () => {
  describe('toString', () => {
    it('provides string representation', () => {
      expect(String(FormationToHubCommChannel)).toBe('[FormationToHubCommChannel]');
    });
  });
});
