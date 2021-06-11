import { describe, expect, it } from '@jest/globals';
import { ContextRegistry } from '@proc7ts/context-values';
import { consoleLogger } from '@proc7ts/logger';
import { UnitLogger } from './unit-logger';

describe('UnitLogger', () => {
  it('defaults to `consoleLogger`', () => {

    const values = new ContextRegistry().newValues();

    expect(values.get(UnitLogger)).toBe(consoleLogger);
  });
});
