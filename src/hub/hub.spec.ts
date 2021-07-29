import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { OrderTest } from '../testing';
import { Hub } from './hub';

describe('Hub', () => {

  let test: OrderTest;

  beforeEach(() => {
    test = OrderTest.setup();
  });
  afterEach(() => {
    test.reset();
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
});