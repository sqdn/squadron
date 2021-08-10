import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import Order from '@sqdn/order';
import { OrderTest } from '../testing';
import { Formation$Host } from './formation.host';

describe('Formation$Host', () => {

  let host: Formation$Host;

  beforeEach(() => {

    const { order } = OrderTest.setup();

    host = order.get(Formation$Host);
  });
  afterEach(() => {
    OrderTest.reset();
  });

  describe('newOrderBuilder', () => {

    let order: Order;

    beforeEach(() => {
      order = host.newOrderBuilder('test-order').context;
    });

    describe('entry', () => {
      it('is the same as `Order.entry`', () => {
        expect(order.entry).toBe(Order.entry);
      });
    });

    describe('current', () => {
      it('is the same as `Order.current`', () => {
        expect(order.current).toBe(Order.current);
      });
    });

    describe('active', () => {
      it('is always `true`', () => {
        expect(order.active).toBe(true);
      });
    });

    describe('orderId', () => {
      it('equals to provided one', () => {
        expect(order.orderId).toBe('test-order');
      });
    });

    describe('toString', () => {
      it('provides string representation', () => {
        expect(String(order)).toBe('[Order test-order]');
      });
    });
  });

  describe('toString', () => {
    it('provides string representation', () => {
      expect(String(Formation$Host)).toBe('[Formation:Host]');
    });
  });
});
