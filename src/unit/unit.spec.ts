import { describe, expect, it } from '@jest/globals';
import { fileURLToPath } from 'url';
import { Unit } from './unit';

describe('Unit', () => {

  class TestUnit extends Unit<TestUnit> {
  }

  describe('uid', () => {
    it('is unique to each unit instantiation location', () => {

      const unit1 = createUnit();
      const unit2 = createUnit();

      expect(unit1.uid).not.toBe(unit2.uid);
    });
    it('is the same for the same instantiation location', () => {

      const units: TestUnit[] = [];

      for (let i = 0; i < 2; ++i) {
        units.push(createUnit());
      }

      const [unit1, unit2] = units;

      expect(unit1.uid).toBe(unit2.uid);
    });
    it('is unique for different ids and the same instantiation location', () => {

      const units: TestUnit[] = [];

      for (let i = 0; i < 2; ++i) {
        units.push(createUnit({ id: String(i) }));
      }

      const [unit1, unit2] = units;

      expect(unit1.uid).not.toBe(unit2.uid);
    });
  });

  describe('toString', () => {
    it('reflects unit type, UID, and origin', () => {

      const unit = createUnit();
      const filePath = fileURLToPath(import.meta.url);
      const pattern = new RegExp(`^TestUnit-${unit.uid}\\((.+)\\)$`);

      expect(unit.toString()).toMatch(pattern);

      const location = pattern.exec(unit.toString())![1];

      expect(location).toContain(filePath);
    });
  });

  function createUnit(init?: Unit.Init): TestUnit {
    return new TestUnit(init);
  }

});
