import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { OnEvent } from '@proc7ts/fun-events';
import { FormationTest, HubTest } from '../testing';
import { Unit } from '../unit';
import { Formation } from './formation';
import { UnitLocation } from './unit-location';
import { UnitLocator } from './unit-locator';

describe('UnitLocator', () => {
  beforeEach(() => {
    HubTest.setup();
  });
  afterEach(() => {
    HubTest.reset();
  });

  describe('at hub', () => {
    let unit: Unit;
    let locator: UnitLocator;

    let location: UnitLocation;
    let onLocation: OnEvent<[UnitLocation]>;

    beforeEach(async () => {
      unit = HubTest.run(() => new Unit());
      locator = HubTest.formationBuilder.get(UnitLocator);
      onLocation = locator.locateUnit(unit);
      onLocation(l => (location = l));
      location ||= await onLocation;
    });

    it('notifies on unit deployment to formation', async () => {
      expect(location).toBeDefined();
      expect(location.formations).toHaveLength(0);
      expect(location.isLocal).toBe(false);

      const formation = HubTest.run(() => new Formation());
      const fmnTest = HubTest.testFormation(formation);

      fmnTest.deploy(unit);
      await fmnTest.evaluate();

      expect(location.formations.map(({ uid }) => uid)).toEqual([formation.uid]);
      expect(location.isLocal).toBe(false);
      expect(location.isDeployedAt(formation)).toBe(true);
      expect(location.isDeployedAt(HubTest.hub)).toBe(false);
    });
    it('notifies on local deployment', async () => {
      HubTest.hub.deploy(unit);
      await HubTest.evaluate();

      expect(location.formations.map(({ uid }) => uid)).toEqual([HubTest.hub.uid]);
      expect(location.isLocal).toBe(true);
      expect(location.isDeployedAt(HubTest.hub)).toBe(true);
    });
  });

  describe('at formation', () => {
    let unit: Unit;
    let formation: Formation;
    let fmnTest: FormationTest;
    let locator: UnitLocator;

    let location: UnitLocation | undefined;
    let onLocation: OnEvent<[UnitLocation]>;

    beforeEach(async () => {
      unit = HubTest.run(() => new Unit());
      formation = HubTest.run(() => new Formation({ tag: 'consumer' }));
      fmnTest = HubTest.testFormation(formation);
      fmnTest.init();
      locator = fmnTest.formationBuilder.get(UnitLocator);
      onLocation = locator.locateUnit(unit);
      onLocation(l => (location = l));
      location ||= await onLocation;
    });

    it('notifies on unit deployment to another formation', async () => {
      expect(location).toBeDefined();
      expect(location?.formations).toHaveLength(0);
      expect(location?.isLocal).toBe(false);

      const formation2 = HubTest.run(
        () => new Formation({ tag: 'other', createdIn: HubTest.createdIn }),
      );
      const fmnTest2 = HubTest.testFormation(formation2);

      fmnTest2.init();

      location = undefined;
      fmnTest2.deploy(unit);
      await HubTest.evaluate();
      await fmnTest.evaluate();
      await fmnTest2.evaluate();
      location ||= await onLocation;
      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(location.formations.map(({ uid }) => uid)).toEqual([formation2.uid]);
      expect(location.isLocal).toBe(false);
      expect(location.isDeployedAt(formation2)).toBe(true);
      expect(location.isDeployedAt(formation)).toBe(false);
      expect(location.isDeployedAt(HubTest.hub)).toBe(false);
    });
    it('notifies on local deployment', async () => {
      location = undefined;
      formation.deploy(unit);
      await fmnTest.evaluate();
      location ||= await onLocation;

      expect(location.formations.map(({ uid }) => uid)).toEqual([formation.uid]);
      expect(location.isLocal).toBe(true);
      expect(location.isDeployedAt(formation)).toBe(true);
      expect(location.isDeployedAt(HubTest.hub)).toBe(false);
    });
  });

  describe('toString', () => {
    it('provides string representation', () => {
      expect(String(UnitLocator)).toBe('[UnitLocator]');
    });
  });
});
