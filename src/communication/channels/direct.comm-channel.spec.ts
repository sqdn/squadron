import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { onPromise } from '@proc7ts/fun-events';
import { noop } from '@proc7ts/primitives';
import { OrderTest } from '../../testing';
import { Unit } from '../../unit';
import { CommError } from '../comm-error';
import { CommReceiver, CommResponder } from '../comm-handler';
import { CommPacket } from '../comm-packet';
import { CommProcessor } from '../comm-processor';
import { HandlerCommProcessor, ProxyCommProcessor } from '../handlers';
import { DirectCommChannel } from './direct.comm-channel';

interface TestPacket extends CommPacket {

  readonly payload: unknown;

}

describe('DirectCommChannel', () => {

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

  let channel: DirectCommChannel;
  let processor: CommProcessor;

  beforeEach(() => {
    channel = new DirectCommChannel({
      to: unit,
      processor: new ProxyCommProcessor(() => processor),
    });
  });

  describe('signal', () => {
    it('processes signal', () => {

      const handler: CommReceiver<TestPacket> = {
        name: 'ping',
        receive: jest.fn(),
      };

      processor = new HandlerCommProcessor(handler);

      const signal: TestPacket = { payload: 'test' };

      channel.signal('ping', signal);
      expect(handler.receive).toHaveBeenCalledWith(signal, channel);
    });
    it('does not send signal when channel closed', () => {

      const reason = new Error('Reason');

      channel.supply.off(reason);

      expect(() => channel.signal('test', {})).toThrow(new CommError(
          unit,
          `Can not send signal "test" to ${unit} over closed channel`,
          reason,
      ));
    });
  });

  describe('request', () => {
    it('processes request', async () => {

      const handler: CommResponder<TestPacket, TestPacket> = {
        name: 'ping',
        respond: jest.fn(request => onPromise({ ...request, payload: { re: request.payload } })),
      };

      processor = new HandlerCommProcessor(handler);

      expect(await channel.request<TestPacket, TestPacket>('ping', { payload: 'test' }))
          .toEqual({ payload: { re: 'test' } });
    });
    it('does not send request when channel closed', () => {

      const reason = new Error('Reason');

      channel.supply.off(reason);

      const whenOff = jest.fn();

      channel.request('test', {})(noop).whenOff(whenOff);
      expect(whenOff).toHaveBeenCalledWith(new CommError(
          unit,
          `Can not send request "test" to ${unit} over closed channel`,
          reason,
      ));
    });
  });
});
