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
      const hub = OrderTest.run(() => new Hub());

      expect(hub.uid).toBe('hub');
    });
    it('can be explicitly specified', () => {
      const hub = OrderTest.run(() => new Hub({ id: 'custom' }));

      expect(hub.uid).toBe('custom');
    });
    it('includes tag', () => {
      const hub = OrderTest.run(() => new Hub({ id: 'custom', tag: 'test' }));

      expect(hub.uid).toBe('test@custom');
    });
  });

  describe('toString', () => {
    it('provides string representation', () => {
      const hub = OrderTest.run(() => new Hub());

      expect(String(hub)).toBe(`[Hub hub(${hub.sourceLink})]`);
    });
    it('provides tagged string representation', () => {
      const hub = OrderTest.run(() => new Hub({ tag: 'test' }));

      expect(String(hub)).toBe(`[Hub test@hub(${hub.sourceLink})]`);
    });
  });
});
