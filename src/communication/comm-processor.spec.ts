import { describe, expect, it } from '@jest/globals';
import { commProcessorBy } from './comm-processor';
import { HandlerCommProcessor, NoopCommProcessor } from './handlers';

describe('commProcessorBy', () => {
  it('converts `undefined` to no-op processor', () => {
    expect(commProcessorBy()).toBe(NoopCommProcessor);
  });
  it('does not convert processor', () => {

    const processor = new HandlerCommProcessor();

    expect(commProcessorBy(processor)).toBe(processor);
  });
});
