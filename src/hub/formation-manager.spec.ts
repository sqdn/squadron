import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { cxConstAsset } from '@proc7ts/context-builder';
import { onEventBy, onPromise } from '@proc7ts/fun-events';
import { Logger } from '@proc7ts/logger';
import { lazyValue } from '@proc7ts/primitives';
import { Supply } from '@proc7ts/supply';
import { MessageChannel } from 'worker_threads';
import { CommPacket, CommProcessor, CommResponder, MessageCommChannel } from '../communication';
import { Formation, FormationContext } from '../formation';
import { Formation$createAssets } from '../impl/formation';
import { Hub$createAssets } from '../impl/hub';
import { OrderTest } from '../testing';
import { FormationManager } from './formation-manager';
import { FormationStarter } from './formation-starter';
import { Hub } from './hub';

describe('FormationManager', () => {

  let testSupply: Supply;

  beforeEach(() => {
    testSupply = new Supply();
  });
  afterEach(() => {
    testSupply.off();
  });

  let hubTest: OrderTest;
  let fmnTests: Map<string, OrderTest>;
  let perFormation: Map<string, (fmnTest: OrderTest) => void>;

  beforeEach(() => {
    fmnTests = new Map();
    perFormation = new Map();

    const { port1, port2 } = new MessageChannel();
    const getHub = lazyValue(() => new Hub({ tag: 'test' }));

    testSupply.whenOff(() => {
      port1.close();
      port2.close();
    });

    hubTest = OrderTest.setup({ getHub, getFormation: getHub });
    hubTest.formationCxBuilder.provide(Hub$createAssets());
    hubTest.formationCxBuilder.provide(cxConstAsset(
        FormationStarter,
        {
          startFormation(formation, { processor }) {

            const fmnTest = OrderTest.setup({
              getHub,
              getFormation: () => formation,
            });

            fmnTests.set(formation.uid, fmnTest);
            fmnTest.formationCxBuilder.provide(Formation$createAssets({
              uid: formation.uid,
              hubUid: getHub().uid,
              hubPort: port2,
            }));
            perFormation.get(formation.uid)?.(fmnTest);

            return new MessageCommChannel({
              to: formation,
              port: port1,
              processor,
              logger: hubTest.order.get(FormationContext).get(Logger),
            });
          },
        },
    ));
  });
  afterEach(() => {
    hubTest.reset();
  });

  let formationManager: FormationManager;

  beforeEach(async () => {
    hubTest.hub.instruct(subject => {
      subject.execute(context => {
        formationManager = context.get(FormationManager);
      });
    });

    await hubTest.evaluate();
  });

  describe('FormationCtl', () => {
    describe('formation', () => {
      it('equals to requested formation', () => {

        const testFmn = new Formation({ tag: 'test-fmn', order: hubTest.order });
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

        const testFmn = new Formation({ tag: 'test-fmn', order: hubTest.order });

        perFormation.set(testFmn.uid, fmnTest => {

          const responder: CommResponder<TestPacket, TestPacket> = {
            name: 'test',
            respond({ payload }) {
              return onEventBy(receiver => {
                onPromise<TestPacket>({ payload: { re: payload } })(receiver);
              });
            },
          };

          fmnTest.formationCxBuilder.provide(cxConstAsset(CommProcessor, responder));
        });

        const channel = formationManager.formationCtl(testFmn).channel;

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
