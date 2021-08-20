import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { cxConstAsset } from '@proc7ts/context-builder';
import { onEventBy, onPromise } from '@proc7ts/fun-events';
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
    await fmnTest.evaluate(false);

    const channel = HubTest.formationBuilder.get(Communicator).connect(formation);

    expect(await channel.request<TestRequest, TestResponse>('test', { payload: 'test data' }))
        .toMatchObject({ re: 'test data' });
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

    const channel = fmnTest.formationBuilder.get(Communicator).connect(fmnTest.hub);

    expect(await channel.request<TestRequest, TestResponse>('test', { payload: 'test data' }))
        .toMatchObject({ re: 'test data' });
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

    await fmnTest1.evaluate(false);
    await fmnTest2.evaluate(false);

    const channel = communicator.connect(unit1);

    expect(await channel.request<TestRequest, TestResponse>('test', { payload: 'test data' }))
        .toMatchObject({ re: 'test data' });
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
