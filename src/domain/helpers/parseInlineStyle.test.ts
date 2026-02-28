import { describe, it, expect } from 'vitest';
import { parseInlineStyle, mmToPt } from './parseInlineStyle';

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

describe('mmToPt', () => {
  it('converts mm to points', () => {
    expect(mmToPt(1)).toBeCloseTo(2.835, 2);
  });

  it('converts 20mm correctly', () => {
    expect(mmToPt(20)).toBeCloseTo(56.7, 0);
  });

  it('returns 0 for 0mm', () => {
    expect(mmToPt(0)).toBe(0);
  });
});
