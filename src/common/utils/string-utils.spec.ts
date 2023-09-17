import { StringUtils } from './string-utils';

describe('StringUtils', () => {
  describe('transformString', () => {
    it('should transform a string correctly', () => {
      const input = 'Hello, World!';
      const expectedOutput = 'hello-world';

      const output = StringUtils.transformString(input);

      expect(output).toEqual(expectedOutput);
    });

    it('should handle empty strings', () => {
      const input = '';
      const expectedOutput = '';

      const output = StringUtils.transformString(input);

      expect(output).toEqual(expectedOutput);
    });

    it('should handle strings with only non-word characters', () => {
      const input = '!@#$%^&*()_+';
      const expectedOutput = '_';

      const output = StringUtils.transformString(input);

      expect(output).toEqual(expectedOutput);
    });

    it('should handle strings with only spaces', () => {
      const input = '   ';
      const expectedOutput = '-';

      const output = StringUtils.transformString(input);

      expect(output).toEqual(expectedOutput);
    });

    it('should handle strings with accents and special characters', () => {
      const input = 'ÁéÍóÚñÇç';
      const expectedOutput = 'aeiouncc';

      const output = StringUtils.transformString(input);

      expect(output).toEqual(expectedOutput);
    });

    it('should handle strings with multiple spaces', () => {
      const input = 'Hello,  World!';
      const expectedOutput = 'hello-world';

      const output = StringUtils.transformString(input);

      expect(output).toEqual(expectedOutput);
    });
  });
});
