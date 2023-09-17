import { TimeUtils } from './time-utils';

describe('TimeUtils', () => {
  describe('currentSeconds', () => {
    it('should return the current time in seconds', () => {
      const now = new Date();
      const expected = Math.round(now.getTime() / 1000);
      const actual = TimeUtils.currentSeconds();
      expect(actual).toBe(expected);
    });
  });

  describe('nextSeconds', () => {
    it('should return the current time in seconds plus the offset', () => {
      const offset = 60;
      const now = new Date();
      const expected = Math.round(now.getTime() / 1000) + offset;
      const actual = TimeUtils.nextSeconds(offset);
      expect(actual).toBe(expected);
    });
  });
});
