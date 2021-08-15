import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EventEmitter, onEventBy, onPromise } from '@proc7ts/fun-events';
import { consoleLogger, processingLogger } from '@proc7ts/logger';
import { asis, noop } from '@proc7ts/primitives';
import { neverSupply, Supply } from '@proc7ts/supply';
import { SpyInstance, spyOn } from 'jest-mock';
import { OrderTest } from '../../testing';
import { Unit } from '../../unit';
import { FIFOCommBuffer } from '../buffers';
import { CommChannel } from '../comm-channel';
import { CommError } from '../comm-error';
import { CommReceiver, CommResponder } from '../comm-handler';
import { CommPacket } from '../comm-packet';
import { CommProcessor } from '../comm-processor';
import { HandlerCommProcessor, ProxyCommProcessor } from '../handlers';
import { DirectCommChannel } from './direct.comm-channel';
import { ProxyCommChannel } from './proxy.comm-channel';

interface TestPacket extends CommPacket {

  readonly payload: unknown;

}

describe('ProxyCommChannel', () => {

  let errorSpy: SpyInstance<void, unknown[]>;
  let warnSpy: SpyInstance<void, unknown[]>;

  beforeEach(() => {
    errorSpy = spyOn(consoleLogger, 'error').mockImplementation(noop);
    warnSpy = spyOn(consoleLogger, 'warn').mockImplementation(noop);
    OrderTest.setup();
  });
  afterEach(() => {
    OrderTest.reset();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  let unit: Unit;

  beforeEach(() => {
    unit = new Unit();
  });

  describe('with single target channel', () => {

    let target: CommChannel;
    let processor: CommProcessor;
    let channel: ProxyCommChannel;

    beforeEach(() => {
      target = new DirectCommChannel({ to: unit, processor: new ProxyCommProcessor(() => processor) });
      channel = new ProxyCommChannel({ to: unit, target });
    });

    describe('to', () => {
      it('contains remote unit', () => {
        expect(channel.to).toBe(unit);
      });
    });

    describe('signal', () => {
      it('proxies signal to target', () => {

        const handler: CommReceiver<TestPacket> = {
          name: 'test',
          receive: jest.fn(() => true),
        };
        const signal: TestPacket = {
          payload: 'test payload',
        };

        processor = new HandlerCommProcessor(handler);

        channel.signal<TestPacket>('test', signal);
        expect(handler.receive).toHaveBeenCalledWith(signal, target);
      });
    });

    describe('request', () => {
      it('proxies request to target', async () => {

        const handler: CommResponder<TestPacket, TestPacket> = {
          name: 'test',
          respond: jest.fn(({ payload }) => onPromise({ payload: { re: payload } })),
        };
        const request: TestPacket = {
          payload: 'test payload',
        };

        processor = new HandlerCommProcessor(handler);

        expect(await channel.request('test', request)).toEqual({ payload: { re: request.payload } });
      });
    });

    describe('supply', () => {
      it('closes target channel', async () => {

        const reason = new Error('Reason');

        channel.supply.off(reason);

        expect(target.supply.isOff).toBe(true);
        expect(await target.supply.whenDone().catch(asis)).toBe(reason);
      });
      it('does not close target channel when `{ closeTarget: false }`', () => {
        channel = new ProxyCommChannel({ to: unit, target, closeTarget: false });
        channel.supply.off();

        expect(target.supply.isOff).toBe(false);
      });
    });
  });

  describe('with target channel sender', () => {

    let targets: EventEmitter<[CommChannel?]>;
    let channel: ProxyCommChannel;

    beforeEach(() => {
      targets = new EventEmitter();
      channel = new ProxyCommChannel({ to: unit, target: targets.on });
    });

    it('closes target channel when switches to another one', () => {

      const target1 = new DirectCommChannel({ to: unit, processor: new HandlerCommProcessor() });
      const target2 = new DirectCommChannel({ to: unit, processor: new HandlerCommProcessor() });

      targets.send(target1);
      targets.send(target2);

      expect(target1.supply.isOff).toBe(true);
      expect(target2.supply.isOff).toBe(false);
    });

    describe('signal', () => {

      beforeEach(() => {
        channel = new ProxyCommChannel({
          to: unit,
          target: targets.on,
          buffer: new FIFOCommBuffer(1),
          logger: processingLogger(consoleLogger),
        });
      });

      it('buffers signal', () => {

        const handler: CommReceiver<TestPacket> = {
          name: 'test',
          receive: jest.fn(),
        };
        const signal: TestPacket = {
          payload: 'test payload',
        };

        channel.signal('test', signal);

        const target = new DirectCommChannel({ to: unit, processor: new HandlerCommProcessor(handler) });

        targets.send(target);
        expect(handler.receive).toHaveBeenCalledWith(signal, target);
      });
      it('warns when buffered signal can not be sent', () => {
        channel.signal('test', {});

        const target = new DirectCommChannel({ to: unit, processor: new HandlerCommProcessor() });

        targets.send(target);
        expect(errorSpy).toHaveBeenCalledWith(
            'Failed to send signal "test" to',
            unit,
            new TypeError(`Unknown signal received: "test"`),
        );
      });
      it('warns when buffered signal aborted', () => {
        channel.signal('test', {});

        const reason = new Error('Reason');

        channel.supply.off(reason);

        expect(warnSpy).toHaveBeenCalledWith('Signal "test" to', unit, 'aborted', reason);
      });
      it('warns on eviction', () => {

        const signal1: TestPacket = {
          payload: 'test payload 1',
        };
        const signal2: TestPacket = {
          payload: 'test payload 1',
        };

        channel.signal('test', signal1);
        channel.signal('test', signal2);

        expect(warnSpy).toHaveBeenLastCalledWith('Signal "test" to', unit, 'aborted', 'Command buffer overflow');
      });
    });

    describe('request', () => {

      beforeEach(() => {
        channel = new ProxyCommChannel({
          to: unit,
          target: targets.on,
          buffer: new FIFOCommBuffer(1),
          logger: processingLogger(consoleLogger),
        });
      });

      it('buffers request', async () => {

        const handler: CommResponder<TestPacket, TestPacket> = {
          name: 'test',
          respond: ({ payload }) => onEventBy(receiver => {
            onPromise({ payload: { re: payload } })(receiver);
          }),
        };
        const request: TestPacket = {
          payload: 'test payload',
        };

        const onResponse = channel.request('test', request);

        const target = new DirectCommChannel({ to: unit, processor: new HandlerCommProcessor(handler) });

        targets.send(target);
        expect(await onResponse).toEqual({ payload: { re: request.payload } });
      });
      it('aborts response when buffered request errors', async () => {

        const onResponse = channel.request('test', {})(noop);
        const target = new DirectCommChannel({ to: unit, processor: new HandlerCommProcessor() });

        targets.send(target);

        expect(await onResponse.whenDone().catch(asis)).toEqual(new TypeError(`Unknown request received: "test"`));
      });
      it('aborts response when buffered request can not be sent', async () => {

        const whenResponded = channel.request('test', {})(noop);
        const target = new DirectCommChannel({ to: unit, processor: new HandlerCommProcessor() });
        const error = new Error('Test');

        spyOn(target, 'request').mockImplementation(() => { throw error; });

        targets.send(target);

        expect(await whenResponded.whenDone().catch(asis)).toEqual(new CommError(
            unit,
            `Failed to send request "test" to ${unit}`,
            error,
        ));
      });
      it('aborts response when buffered request aborted', async () => {

        const whenResponded = channel.request('test', {})(noop);
        const reason = new Error('Reason');

        targets.supply.off(reason);

        expect(await whenResponded.whenDone().catch(asis)).toEqual(new CommError(
            unit,
            `Request "test" to ${unit} aborted`,
            reason,
        ));
      });
    });

    describe('supply', () => {
      it('closes target channel', async () => {

        const target = new DirectCommChannel({ to: unit, processor: new HandlerCommProcessor() });

        targets.send(target);

        const reason = new Error('Reason');

        channel.supply.off(reason);

        expect(target.supply.isOff).toBe(true);
        expect(await target.supply.whenDone().catch(asis)).toBe(reason);
      });
      it('does not close target channel when `{ closeTarget: false }`', () => {
        channel = new ProxyCommChannel({ to: unit, target: targets.on, closeTarget: false });

        const target = new DirectCommChannel({ to: unit, processor: new HandlerCommProcessor() });

        targets.send(target);
        channel.supply.off();

        expect(target.supply.isOff).toBe(false);
      });
    });

    describe('buffering', () => {

      let targets: EventEmitter<[CommChannel?]>;
      let channel: ProxyCommChannel;

      beforeEach(() => {
        targets = new EventEmitter();
        channel = new ProxyCommChannel({ to: unit, target: targets.on });
      });

      let processor: CommProcessor;
      let handler: CommReceiver<TestPacket>;

      beforeEach(() => {
        handler = {
          name: 'test',
          receive: jest.fn(),
        };
        processor = new HandlerCommProcessor(handler);
      });

      let signal1: TestPacket;
      let signal2: TestPacket;

      beforeEach(() => {
        signal1 = {
          payload: 'test payload 1',
        };
        signal2 = {
          payload: 'test payload 2',
        };
      });

      it('starts buffering when closed target received', () => {
        channel.signal('test', signal1);

        const target1 = new DirectCommChannel({
          to: unit,
          supply: neverSupply(),
          processor: new HandlerCommProcessor(),
        });

        targets.send(target1);

        channel.signal('test', signal2);

        const target2 = new DirectCommChannel({ to: unit, processor });

        targets.send(target2);
        expect(handler.receive).toHaveBeenCalledWith(signal1, target2);
        expect(handler.receive).toHaveBeenCalledWith(signal2, target2);
        expect(handler.receive).toHaveBeenCalledTimes(2);
      });
      it('starts buffering when `undefined` target received', () => {

        const target1 = new DirectCommChannel({ to: unit, processor: new HandlerCommProcessor() });

        targets.send(target1);
        targets.send();
        channel.signal('test', signal1);
        channel.signal('test', signal2);

        const target2 = new DirectCommChannel({ to: unit, processor });

        targets.send(target2);
        expect(handler.receive).toHaveBeenCalledWith(signal1, target2);
        expect(handler.receive).toHaveBeenCalledWith(signal2, target2);
        expect(handler.receive).toHaveBeenCalledTimes(2);
      });
      it('handles closing target while draining buffer', () => {
        channel.signal('test', signal1);
        channel.signal('test', signal2);

        const supply1 = new Supply();
        const handler1: CommReceiver<TestPacket> = {
          name: 'test',
          receive() {
            supply1.off();
            return true;
          },
        };
        const target1 = new DirectCommChannel({
          to: unit,
          supply: supply1,
          processor: new HandlerCommProcessor(handler1),
        });

        targets.send(target1);
        expect(target1.supply.isOff).toBe(true);

        const target2 = new DirectCommChannel({ to: unit, processor });

        targets.send(target2);
        expect(handler.receive).toHaveBeenCalledWith(signal2, target2);
        expect(handler.receive).toHaveBeenCalledTimes(1);
      });
    });
  });
});
