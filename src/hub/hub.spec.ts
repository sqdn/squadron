import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { OrderTest } from '../testing';
import { Hub } from './hub';

describe('Hub', () => {
  beforeEach(() => {
    OrderTest.setup();
  });
  afterEach(() => {
    OrderTest.reset();
  });

  describe('uid', () => {
    it('is "hub" by default', () => {
      expect(new Hub().uid).toBe('hub');
    });
    it('can be explicitly specified', () => {
      expect(new Hub({ id: 'custom' }).uid).toBe('custom');
    });
    it('includes tag', () => {
      expect(new Hub({ id: 'custom', tag: 'test' }).uid).toBe('test@custom');
    });
  });

  describe('toString', () => {
    it('provides string representation', () => {

      const hub = new Hub();

      expect(String(hub)).toBe(`[Hub hub(${hub.sourceLink})]`);
    });
    it('provides tagged string representation', () => {

      const hub = new Hub({ tag: 'test' });

      expect(String(hub)).toBe(`[Hub test@hub(${hub.sourceLink})]`);
    });
  });
});
