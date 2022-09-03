import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { onPromise } from '@proc7ts/fun-events';
import { noop } from '@proc7ts/primitives';
import { OrderTest } from '../../testing';
import { Unit } from '../../unit';
import { CommError } from '../comm-error';
import { CommReceiver, CommResponder } from '../comm-handler';
import { CommPacket } from '../comm-packet';
import { CommProcessor, commProcessorBy } from '../comm-processor';
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
    unit = OrderTest.run(() => new Unit());
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
      const receiver: CommReceiver<TestPacket> = {
        name: 'ping',
        receive: jest.fn(() => true),
      };

      processor = commProcessorBy(receiver);

      const signal: TestPacket = { payload: 'test' };

      channel.signal('ping', signal);
      expect(receiver.receive).toHaveBeenCalledWith(signal);
    });
    it('processes signal with command processor', () => {
      const handler: CommReceiver<TestPacket> = {
        name: 'ping',
        receive: jest.fn(() => true),
      };

      processor = new HandlerCommProcessor(new HandlerCommProcessor(handler));

      const signal: TestPacket = { payload: 'test' };

      channel.signal('ping', signal);
      expect(handler.receive).toHaveBeenCalledWith(signal);
    });
    it('processes signal with fallback handler', () => {
      const receiver1: CommReceiver<TestPacket> = {
        name: 'ping',
        receive: jest.fn<(signal: TestPacket) => boolean>(),
      };
      const receiver2: CommReceiver<TestPacket> = {
        name: 'ping',
        receive: jest.fn<(signal: TestPacket) => boolean>(() => true),
      };

      processor = new HandlerCommProcessor(receiver1, receiver2);

      const signal: TestPacket = { payload: 'test' };

      channel.signal('ping', signal);
      expect(receiver1.receive).toHaveBeenCalledWith(signal);
      expect(receiver2.receive).toHaveBeenCalledWith(signal);
    });
    it('processes signal with fallback processor', () => {
      const receiver1: CommReceiver<TestPacket> = {
        name: 'ping',
        receive: jest.fn<(signal: TestPacket) => boolean>(),
      };
      const receiver2: CommReceiver<TestPacket> = {
        name: 'ping',
        receive: jest.fn(() => true),
      };

      processor = new HandlerCommProcessor(receiver1, new HandlerCommProcessor(receiver2));

      const signal: TestPacket = { payload: 'test' };

      channel.signal('ping', signal);
      expect(receiver1.receive).toHaveBeenCalledWith(signal);
      expect(receiver2.receive).toHaveBeenCalledWith(signal);
    });
    it('does not send signal when channel closed', () => {
      const reason = new Error('Reason');

      channel.supply.off(reason);

      expect(() => channel.signal('test', {})).toThrow(
        new CommError(unit, `Can not send signal "test" to ${unit} over closed channel`, reason),
      );
    });
  });

  describe('request', () => {
    it('responds to request', async () => {
      const responder: CommResponder<TestPacket, TestPacket> = {
        name: 'ping',
        respond: jest.fn(request => onPromise({ ...request, payload: { re: request.payload } })),
      };

      processor = commProcessorBy(responder);

      expect(await channel.request<TestPacket, TestPacket>('ping', { payload: 'test' })).toEqual({
        payload: { re: 'test' },
      });
    });
    it('responds to request by command processor', async () => {
      const responder: CommResponder<TestPacket, TestPacket> = {
        name: 'ping',
        respond: jest.fn(request => onPromise({ ...request, payload: { re: request.payload } })),
      };

      processor = new HandlerCommProcessor(new HandlerCommProcessor(responder));

      expect(await channel.request<TestPacket, TestPacket>('ping', { payload: 'test' })).toEqual({
        payload: { re: 'test' },
      });
    });
    it('responds to request with fallback responder', async () => {
      const responder1: CommResponder<TestPacket, TestPacket> = {
        name: 'ping',
        respond: noop,
      };
      const responder2: CommResponder<TestPacket, TestPacket> = {
        name: 'ping',
        respond: request => onPromise({ ...request, payload: { re: request.payload } }),
      };

      processor = new HandlerCommProcessor(responder1, responder2);

      expect(await channel.request<TestPacket, TestPacket>('ping', { payload: 'test' })).toEqual({
        payload: { re: 'test' },
      });
    });
    it('responds to request with fallback processor', async () => {
      const responder1: CommResponder<TestPacket, TestPacket> = {
        name: 'ping',
        respond: noop,
      };
      const responder2: CommResponder<TestPacket, TestPacket> = {
        name: 'ping',
        respond: request => onPromise({ ...request, payload: { re: request.payload } }),
      };

      processor = new HandlerCommProcessor(responder1, new HandlerCommProcessor(responder2));

      expect(await channel.request<TestPacket, TestPacket>('ping', { payload: 'test' })).toEqual({
        payload: { re: 'test' },
      });
    });
    it('does not send request when channel closed', () => {
      const reason = new Error('Reason');

      channel.supply.off(reason);

      const whenOff = jest.fn();

      channel.request('test', {})(noop).whenOff(whenOff);
      expect(whenOff).toHaveBeenCalledWith(
        new CommError(unit, `Can not send request "test" to ${unit} over closed channel`, reason),
      );
    });
  });
});
