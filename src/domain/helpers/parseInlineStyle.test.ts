import { describe, it, expect } from 'vitest';
import { parseInlineStyle } from './parseInlineStyle';

describe('parseInlineStyle', () => {
  it('parses a simple color style', () => {
    expect(parseInlineStyle('color: red')).toEqual({ color: 'red' });
  });

  it('parses multiple declarations', () => {
    expect(parseInlineStyle('color: red; background-color: blue')).toEqual({
      color: 'red',
      backgroundColor: 'blue',
    });
  });

  it('converts kebab-case to camelCase', () => {
    expect(parseInlineStyle('font-weight: bold')).toEqual({
      fontWeight: 'bold',
    });
  });

  it('handles empty string', () => {
    expect(parseInlineStyle('')).toEqual({});
  });

  it('handles undefined', () => {
    expect(parseInlineStyle(undefined)).toEqual({});
  });

  it('handles hex colors', () => {
    expect(parseInlineStyle('color: #ff0000')).toEqual({ color: '#ff0000' });
  });
});
