import { describe, expect, it } from '@jest/globals';
import { NoopCommProcessor } from './noop.comm-processor';

describe('NoopCommProcessor', () => {
  describe('receive', () => {
    it('does not process signals', () => {
      expect(NoopCommProcessor.receive(null!, null!)).toBe(false);
      expect(new NoopCommProcessor().receive(null!, null!)).toBe(false);
    });
  });
  describe('respond', () => {
    it('does not respond', () => {
      expect(NoopCommProcessor.respond(null!, null!)).toBeUndefined();
      expect(new NoopCommProcessor().respond(null!, null!)).toBeUndefined();
    });
  });
});
