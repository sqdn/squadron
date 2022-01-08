import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { Formation } from '../../formation';
import { HubTest } from '../../testing';
import { Unit } from '../../unit';
import { CommLinker } from './comm-linker';

describe('CommLinker', () => {

  beforeEach(() => {
    HubTest.setup();
  });
  afterEach(() => {
    HubTest.reset();
  });

  it('links hub -> formation', async () => {

    const formation = HubTest.run(() => new Formation());
    const fmnTest = HubTest.testFormation(formation);

    fmnTest.init();
    await fmnTest.evaluate();

    const linker = HubTest.formationBuilder.get(CommLinker);
    const link = linker.link(formation);

    expect(link.to).toBe(formation);
    expect(linker.link(formation)).toBe(link);
  });
  it('links formation -> formation', async () => {

    const formation1 = HubTest.run(() => new Formation({ tag: '1' }));
    const formation2 = HubTest.run(() => new Formation({ tag: '2' }));
    const unit2 = HubTest.run(() => new Unit({ tag: '2' }));

    const fmnTest1 = HubTest.testFormation(formation1);

    fmnTest1.init();

    let linker!: CommLinker;
    const fmnTest2 = HubTest.testFormation(formation2);

    fmnTest2.deploy(unit2).instruct(subject => {
      subject.execute(context => {
        linker = context.get(CommLinker);
      });
    });

    fmnTest2.init();

    await fmnTest1.evaluate();
    await fmnTest2.evaluate();

    const link = linker.link(formation1);

    expect(link.to).toBe(formation1);
    expect(linker.link(formation1)).toBe(link);
  });

  describe('toString', () => {
    it('provides string representation', () => {
      expect(String(CommLinker)).toBe('[CommLinker]');
    });
  });
});
