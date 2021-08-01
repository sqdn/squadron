import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { OrderTest } from '../../testing';
import { Unit } from '../../unit';
import { ClosedCommChannel } from './closed.comm-channel';

describe('ClosedCommChannel', () => {
  beforeEach(() => {
    OrderTest.setup();
  });
  afterEach(() => {
    OrderTest.reset();
  });

  let unit: Unit;

  beforeEach(() => {
    unit = new Unit();
  });

  describe('supply', () => {
    it('reflects why channel closed', () => {

      const reason = new Error('Reason');
      const channel = new ClosedCommChannel(unit, reason);
      const whenOff = jest.fn();

      channel.supply.whenOff(whenOff);
      expect(whenOff).toHaveBeenCalledWith(reason);
    });
  });
});
