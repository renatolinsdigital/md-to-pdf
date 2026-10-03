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

    it('unwraps when the markers sit just outside the selection', () => {
      const result = applyFormat(
        '**hello** world',
        { start: 2, end: 7 },
        { type: 'wrap', prefix: '**', suffix: '**' },
      );

      expect(result.text).toBe('hello world');
      expect(result.selection).toEqual({ start: 0, end: 5 });
    });

    it('unwraps when the selection includes the markers', () => {
      const result = applyFormat(
        'say <span style="color: red">hi</span>',
        { start: 4, end: 38 },
        { type: 'wrap', prefix: '<span style="color: red">', suffix: '</span>' },
      );

      expect(result.text).toBe('say hi');
      expect(result.selection).toEqual({ start: 4, end: 6 });
    });

    it('adds italic to bold text instead of reading the bold markers as italic', () => {
      const result = applyFormat(
        '**hello**',
        { start: 2, end: 7 },
        { type: 'wrap', prefix: '*', suffix: '*' },
      );

      expect(result.text).toBe('***hello***');
    });

    it.each([
      ['bold', '**', '*hello*'],
      ['italic', '*', '**hello**'],
    ])('removes only %s from bold italic text', (_, marker, expected) => {
      const result = applyFormat(
        '***hello***',
        { start: 3, end: 8 },
        { type: 'wrap', prefix: marker, suffix: marker },
      );

      expect(result.text).toBe(expected);
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

    it('removes the prefix when the line already has it', () => {
      const result = applyFormat(
        'first\n## second',
        { start: 12, end: 12 },
        { type: 'linePrefix', prefix: '## ' },
      );

      expect(result.text).toBe('first\nsecond');
      expect(result.selection).toEqual({ start: 9, end: 9 });
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
