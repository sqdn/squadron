import { afterEach, describe, expect, it } from '@jest/globals';
import { FormationContext } from '../formation';
import { HubTest } from './hub-test';

describe('HubTest', () => {

  afterEach(() => {
    HubTest.reset();
  });

  describe('hub', () => {
    it('sets up the test automatically', () => {
      expect(HubTest.hub).toBe(HubTest.createdIn.get(FormationContext).hub);
    });
  });

  describe('formation', () => {
    it('is the hub itself', () => {
      expect(HubTest.formation).toBe(HubTest.hub);
    });
  });

});
