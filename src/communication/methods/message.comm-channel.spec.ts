import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { onEventBy, onPromise } from '@proc7ts/fun-events';
import { consoleLogger } from '@proc7ts/logger';
import { asis, newPromiseResolver, noop } from '@proc7ts/primitives';
import { Supply } from '@proc7ts/supply';
import { SpyInstance, spyOn } from 'jest-mock';
import { MessageChannel, MessagePort } from 'worker_threads';
import { OrderTest } from '../../testing';
import { Unit } from '../../unit';
import { CommHandler, CommReceiver, CommResponder } from '../comm-handler';
import { CommPacket } from '../comm-packet';
import { CommProcessor, createCommProcessor, proxyCommProcessor } from '../comm-processor';
import { MessageCommChannel } from './message.comm-channel';

interface TestPacket extends CommPacket {

  readonly payload: unknown;

}

describe('MessageCommChannel', () => {

  let errorSpy: SpyInstance<void, unknown[]>;

  beforeEach(() => {
    errorSpy = spyOn(consoleLogger, 'error');
    OrderTest.setup();
  });
  afterEach(() => {
    OrderTest.reset();
    errorSpy.mockRestore();
  });

  let unit1: Unit;
  let unit2: Unit;

  beforeEach(() => {
    unit1 = new Unit({ tag: '1' });
    unit2 = new Unit({ tag: '2' });
  });

  let port1: MessagePort;
  let port2: MessagePort;
  let channel: MessageCommChannel;
  let remoteChannel: MessageCommChannel;
  let remoteProcessor: CommProcessor;

  beforeEach(() => {
    ({ port1, port2 } = new MessageChannel());

    channel = new MessageCommChannel({
      to: unit2,
      port: port1,
    });

    remoteProcessor = createCommProcessor();
    remoteChannel = new MessageCommChannel({
      to: unit1,
      port: port2,
      processor: proxyCommProcessor(() => remoteProcessor),
    });
  });
  afterEach(() => {
    channel.supply.off();
    remoteChannel.supply.off();
  });

  describe('to', () => {
    it('equals to remote unit', () => {
      expect(channel.to).toBe(unit2);
    });
  });

  describe('supply', () => {
    it('closes remote channel', async () => {
      channel.supply.off();
      expect(await remoteChannel.supply.whenDone()).toBeUndefined();
    });
    it('closes client channel', async () => {
      remoteChannel.supply.off();
      expect(await channel.supply.whenDone()).toBeUndefined();
    });
  });

  describe('signal', () => {
    it('sends signal', async () => {

      const resolver = newPromiseResolver();
      const handler: CommHandler<TestPacket, void> = {
        name: 'ping',
        receive: jest.fn(() => resolver.resolve()),
      };

      remoteProcessor = createCommProcessor(handler);

      channel.signal<TestPacket>('ping', { payload: 'test' });
      await resolver.promise();

      expect(handler.receive).toHaveBeenCalledWith(expect.objectContaining({ payload: 'test' }), remoteChannel);
    });
    it('transfers objects', async () => {

      const resolver = newPromiseResolver();
      const handler: CommHandler<TestPacket, void> = {
        name: 'ping',
        receive: jest.fn(() => resolver.resolve()),
      };

      remoteProcessor = createCommProcessor(handler);

      const payload = new Int8Array([1, 2, 3, 99]).buffer;

      channel.signal<TestPacket>('ping', { meta: { transferList: [payload] }, payload });
      await resolver.promise();

      expect(handler.receive).toHaveBeenCalledWith({ meta: {}, payload }, remoteChannel);
    });
  });

  describe('request', () => {
    it('sends request', async () => {

      const handler: CommResponder<TestPacket, TestPacket> = {
        name: 'ping',
        respond: jest.fn(request => onPromise({ ...request, payload: { re: request.payload } })),
      };

      remoteProcessor = createCommProcessor(handler);

      expect(await channel.request<TestPacket, TestPacket>('ping', { payload: 'test' }))
          .toMatchObject({ payload: { re: 'test' } });
    });
    it('ends remote request processing', async () => {

      const remoteSupplyResolver = newPromiseResolver<Supply>();
      const handler: CommResponder<TestPacket, TestPacket> = {
        name: 'ping',
        respond: () => onEventBy(({ supply }) => {
          remoteSupplyResolver.resolve(supply);
        }),
      };

      remoteProcessor = createCommProcessor(handler);

      const supply = channel.request<TestPacket, TestPacket>('ping', { payload: 'test' })(noop);
      const remoteSupply = await remoteSupplyResolver.promise();
      const reason = new Error('Test');

      supply.off(reason);

      expect(await remoteSupply.whenDone().catch(asis)).toMatchObject({ message: 'Test' });
    });
    it('is closed by remote party', async () => {

      const reason = new Error('Test');
      const handler: CommResponder<TestPacket, TestPacket> = {
        name: 'ping',
        respond: () => onEventBy(({ supply }) => {
          supply.off(reason);
        }),
      };

      remoteProcessor = createCommProcessor(handler);

      const supply = channel.request<TestPacket, TestPacket>('ping', { payload: 'test' })(noop);

      expect(await supply.whenDone().catch(asis)).toMatchObject({ message: 'Test' });
    });
  });

  describe('processing', () => {
    it('fails to process unrecognized message', async () => {

      const resolver = newPromiseResolver();
      const message = 'unknown';

      errorSpy.mockImplementation(() => resolver.resolve());
      port1.postMessage(message);

      await resolver.promise();
      expect(errorSpy).toHaveBeenCalledWith('Unrecognized message received', message);
    });
    it('fails to process message of unrecognized type', async () => {

      const resolver = newPromiseResolver();
      const message = { sqdn: { type: Infinity } };

      errorSpy.mockImplementation(() => resolver.resolve());
      port1.postMessage(message);

      await resolver.promise();
      expect(errorSpy).toHaveBeenCalledWith('Unrecognized message received', message);
    });
    it('fails to process message without body', async () => {

      const resolver = newPromiseResolver();
      const message = { sqdn: { type: 0, name: 'test' } };

      errorSpy.mockImplementation(() => resolver.resolve());
      port1.postMessage(message);

      await resolver.promise();
      expect(errorSpy).toHaveBeenCalledWith('Unrecognized message received', message);
    });
    it('fails to process request without stream ID', async () => {

      const resolver = newPromiseResolver();
      const message = { sqdn: { type: 1, name: 'test', body: { data: 'test' } } };

      errorSpy.mockImplementation(() => resolver.resolve());
      port1.postMessage(message);

      await resolver.promise();
      expect(errorSpy).toHaveBeenCalledWith('Unrecognized request received', message.sqdn.body);
    });
    it('fails to process unexpected response', async () => {

      const resolver = newPromiseResolver();
      const message = { sqdn: { type: 2, name: 'test', body: { data: 'test' } } };

      errorSpy.mockImplementation(() => resolver.resolve());
      port1.postMessage(message);

      await resolver.promise();
      expect(errorSpy).toHaveBeenCalledWith('Unexpected response received', message.sqdn.body);
    });
    it('ignores unexpected end request', async () => {

      const resolver = newPromiseResolver();
      const message = { sqdn: { type: 3, name: 'test', body: { data: 'test' } } };

      const handler: CommReceiver = {
        name: 'test',
        receive: () => resolver.resolve(),
      };

      remoteProcessor = createCommProcessor(handler);

      port1.postMessage(message);
      channel.signal('test', {});

      await resolver.promise();
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });
});
