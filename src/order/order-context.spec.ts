import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { AsyncResource } from 'node:async_hooks';
import { OrderTest } from '../testing';
import { OrderContext } from './order-context';

describe('OrderContext', () => {
  let test: OrderTest;

  beforeEach(() => {
    test = OrderTest.setup();
  });
  afterEach(() => {
    OrderTest.reset();
  });

  it('is available as its own entry', () => {
    expect(test.createdIn.get(OrderContext)).toBe(test.createdIn);
  });

  describe('orderId', () => {
    it('can be explicitly specified', () => {
      const orderContext = test.newOrder({ orderId: 'test' });

      expect(orderContext.orderId).toBe('test');
    });
    it('assigned automatically', () => {
      const orderContext = test.newOrder();

      expect(orderContext.orderId).toMatch(/^[0-9a-f-]+/);
    });
  });

  describe('current', () => {
    it('throws outside context', () => {
      expect(OrderContext.current).toThrow(new ReferenceError('Order unavailable outside context'));
    });
    it('returns current context', () => {
      const orderContext = test.newOrder();

      expect(orderContext.run(() => OrderContext.current())).toBe(orderContext);
    });
    it('returns current context asynchronously', async () => {
      const orderContext = test.newOrder();

      expect(
        await orderContext.run(
          async () => await Promise.resolve().then(() => OrderContext.current()),
        ),
      ).toBe(orderContext);
    });
    it('returns current context when bound', () => {
      const orderContext = test.newOrder();

      expect(orderContext.run(() => AsyncResource.bind(OrderContext.current))()).toBe(orderContext);
    });
  });

  describe('toString', () => {
    it('returns string representation', () => {
      const orderContext = OrderTest.newOrder();

      expect(String(orderContext)).toBe(`[OrderContext ${orderContext.orderId}]`);
    });
  });

  describe('Entry', () => {
    describe('toString', () => {
      it('returns string representation', () => {
        expect(String(OrderContext)).toBe('[OrderContext]');
      });
    });
  });
});
