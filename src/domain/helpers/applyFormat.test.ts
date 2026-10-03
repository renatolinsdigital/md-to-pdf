import { describe, it, expect } from 'vitest';
import { applyFormat } from './applyFormat';

describe('applyFormat', () => {
  describe('wrap', () => {
    it('wraps the selection and keeps it selected', () => {
      const result = applyFormat(
        'hello world',
        { start: 0, end: 5 },
        { type: 'wrap', prefix: '**', suffix: '**' },
      );

      expect(result.text).toBe('**hello** world');
      expect(result.selection).toEqual({ start: 2, end: 7 });
    });

    it('inserts a selected placeholder when nothing is selected', () => {
      const result = applyFormat(
        'ab',
        { start: 1, end: 1 },
        { type: 'wrap', prefix: '`', suffix: '`' },
      );

      expect(result.text).toBe('a`text`b');
      expect(result.selection).toEqual({ start: 2, end: 6 });
    });
  });

  describe('linePrefix', () => {
    it('prefixes the line holding the caret', () => {
      const result = applyFormat(
        'first\nsecond',
        { start: 9, end: 9 },
        { type: 'linePrefix', prefix: '# ' },
      );

      expect(result.text).toBe('first\n# second');
      expect(result.selection).toEqual({ start: 11, end: 11 });
    });

    it('prefixes the first line when the caret is at the very start', () => {
      const result = applyFormat(
        '\nnext',
        { start: 0, end: 0 },
        { type: 'linePrefix', prefix: '- ' },
      );

      expect(result.text).toBe('- \nnext');
    });
  });

  describe('insert', () => {
    it('inserts at the caret and moves the caret after the insertion', () => {
      const result = applyFormat('ab', { start: 1, end: 1 }, { type: 'insert', text: '<br>' });

      expect(result.text).toBe('a<br>b');
      expect(result.selection).toEqual({ start: 5, end: 5 });
    });
  });
});
