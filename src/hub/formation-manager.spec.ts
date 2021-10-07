import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { cxConstAsset } from '@proc7ts/context-builder';
import { onEventBy, onPromise } from '@proc7ts/fun-events';
import { CommPacket, CommProtocol, CommResponder } from '../communication';
import { Formation } from '../formation';
import { HubTest } from '../testing/hub-test';
import { FormationManager } from './formation-manager';

describe('FormationManager', () => {

  beforeEach(() => {
    HubTest.setup();
  });
  afterEach(() => {
    HubTest.reset();
  });

  let formationManager: FormationManager;

  beforeEach(async () => {
    HubTest.hub.instruct(subject => {
      subject.run(context => {
        formationManager = context.get(FormationManager);
      });
    });
    await HubTest.evaluate();
  });

  describe('FormationCtl', () => {
    describe('formation', () => {
      it('equals to requested formation', () => {

        const testFmn = new Formation({ tag: 'test-fmn', order: HubTest.order });
        const ctl = formationManager.formationCtl(testFmn);

        expect(ctl.formation).toBe(testFmn);
        expect(formationManager.formationCtl(testFmn)).toBe(ctl);
      });
    });
    describe('channel', () => {
      it('connected to started formation', async () => {

        interface TestPacket extends CommPacket {

          payload: unknown;

        }

        const testFmn = new Formation({ tag: 'test-fmn', order: HubTest.order });
        const fmnTest = HubTest.testFormation(testFmn);
        const responder: CommResponder<TestPacket, TestPacket> = {
          name: 'test',
          respond({ payload }) {
            return onEventBy(receiver => {
              onPromise<TestPacket>({ payload: { re: payload } })(receiver);
            });
          },
        };

        fmnTest.formationBuilder.provide(cxConstAsset(CommProtocol, responder));

        fmnTest.init();

        const ctl = formationManager.formationCtl(testFmn);
        const channel = ctl.channel;

        expect(ctl.channel).toBe(channel);
        expect(await channel.request<TestPacket, TestPacket>('test', { payload: 'test payload' }))
            .toMatchObject({ payload: { re: 'test payload' } });
      });
    });
  });

  describe('toString', () => {
    it('provides string representation', () => {
      expect(String(FormationManager)).toBe('[FormationManager]');
    });
  });
});
