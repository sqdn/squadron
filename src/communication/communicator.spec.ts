import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { cxConstAsset } from '@proc7ts/context-builder';
import { onEventBy, onPromise } from '@proc7ts/fun-events';
import { Logger, logline, processingLogger } from '@proc7ts/logger';
import { Formation } from '../formation';
import { HubTest } from '../testing';
import { Unit } from '../unit';
import { CommResponder } from './comm-handler';
import { CommPacket } from './comm-packet';
import { CommProtocol } from './comm-protocol';
import { Communicator } from './communicator';

describe('Communicator', () => {
  beforeEach(() => {
    HubTest.setup();
  });
  afterEach(() => {
    HubTest.reset();
  });

  it('connects hub -> formation', async () => {

    const formation = new Formation();
    const fmnTest = HubTest.testFormation(formation);
    const responder: CommResponder<TestRequest, TestResponse> = {
      name: 'test',
      respond: ({ payload }) => onEventBy(receiver => {
        onPromise<TestResponse>({ re: payload })(receiver);
      }),
    };

    fmnTest.formationBuilder.provide(cxConstAsset(CommProtocol, responder));
    fmnTest.init();
    await fmnTest.evaluate();

    const communicator = HubTest.formationBuilder.get(Communicator);
    const channel = communicator.connect(formation);

    expect(await channel.request<TestRequest, TestResponse>('test', { payload: 'test data' }))
        .toMatchObject({ re: 'test data' });
    expect(communicator.connect(formation)).toBe(channel);

    channel.supply.off();
    expect(communicator.connect(formation)).not.toBe(channel);
  });
  it('connects formation -> hub', async () => {

    const responder: CommResponder<TestRequest, TestResponse> = {
      name: 'test',
      respond: ({ payload }) => onEventBy(receiver => {
        onPromise<TestResponse>({ re: payload })(receiver);
      }),
    };

    HubTest.formationBuilder.provide(cxConstAsset(CommProtocol, responder));

    const formation = new Formation();
    const fmnTest = HubTest.testFormation(formation);

    fmnTest.init();

    const communicator = fmnTest.formationBuilder.get(Communicator);
    const channel = communicator.connect(fmnTest.hub);

    expect(await channel.request<TestRequest, TestResponse>('test', { payload: 'test data' }))
        .toMatchObject({ re: 'test data' });
    expect(communicator.connect(fmnTest.hub)).toBe(channel);

    channel.supply.off();
    expect(communicator.connect(fmnTest.hub)).not.toBe(channel);
  });
  it('connects unit -> unit', async () => {

    const formation1 = new Formation({ tag: '1' });
    const unit1 = new Unit({ tag: '1' });
    const formation2 = new Formation({ tag: '2' });
    const unit2 = new Unit({ tag: '2' });

    const fmnTest1 = HubTest.testFormation(formation1);

    fmnTest1.deploy(unit1).instruct(subject => {

      const responder: CommResponder<TestRequest, TestResponse> = {
        name: 'test',
        respond: ({ payload }) => onEventBy(receiver => {
          onPromise<TestResponse>({ re: payload })(receiver);
        }),
      };

      subject.provide(cxConstAsset(CommProtocol, responder));
    });

    fmnTest1.init();

    let communicator!: Communicator;
    const fmnTest2 = HubTest.testFormation(formation2);


    fmnTest2.deploy(unit2).instruct(subject => {
      subject.execute(context => {
        communicator = context.get(Communicator);
      });
    });

    fmnTest2.init();

    await fmnTest1.evaluate();
    await fmnTest2.evaluate();

    const channel = communicator.connect(unit1);

    expect(await channel.request<TestRequest, TestResponse>('test', { payload: 'test data' }))
        .toMatchObject({ re: 'test data' });
    expect(communicator.connect(unit1)).toBe(channel);

    channel.supply.off();
    expect(communicator.connect(unit1)).not.toBe(channel);
  });
  it('connects unit -> unit directly', async () => {

    const formation = new Formation();
    const unit1 = new Unit({ tag: '1' });
    const unit2 = new Unit({ tag: '2' });

    let communicator!: Communicator;
    const fmnTest = HubTest.testFormation(formation);

    fmnTest.deploy(unit1).instruct(subject => {

      const responder: CommResponder<TestRequest, TestResponse> = {
        name: 'test',
        respond: ({ payload }) => onEventBy(receiver => {
          onPromise<TestResponse>({ re: payload })(receiver);
        }),
      };

      subject.provide(cxConstAsset(CommProtocol, responder));
    });
    fmnTest.deploy(unit2).instruct(subject => {
      subject.execute(context => {
        communicator = context.get(Communicator);
      });
    });

    fmnTest.init();

    await fmnTest.evaluate();

    const channel = communicator.connect(unit1);

    expect(await channel.request<TestRequest, TestResponse>('test', { payload: 'test data' }))
        .toMatchObject({ re: 'test data' });
    expect(communicator.connect(unit1)).toBe(channel);

    channel.supply.off();
    expect(communicator.connect(unit1)).not.toBe(channel);
  });
  it('buffers commands to not deployed unit', () => {

    const logger: Logger = {
      warn: jest.fn(),
    } as Partial<Logger> as Logger;

    HubTest.formationBuilder.provide(cxConstAsset(Logger, processingLogger(logger)));

    const communicator = HubTest.formationBuilder.get(Communicator);
    const unit = new Unit({ tag: 'non-deployed' });
    const channel = communicator.connect(unit);

    channel.signal('test', {});
    channel.supply.off();

    expect(logger.warn).toHaveBeenCalledWith(...logline`Signal "test" to ${unit} aborted`, undefined);
  });

  describe('toString', () => {
    it('provides string representation', () => {
      expect(String(Communicator)).toBe('[Communicator]');
    });
  });
});

interface TestRequest extends CommPacket {

  readonly payload: unknown;

}

interface TestResponse extends CommPacket {

  readonly re: unknown;

}
