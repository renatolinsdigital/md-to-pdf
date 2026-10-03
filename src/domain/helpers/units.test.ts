import { describe, it, expect } from 'vitest';
import { mmToPt } from './units';

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
