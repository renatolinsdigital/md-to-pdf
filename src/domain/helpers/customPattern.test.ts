import { describe, it, expect } from 'vitest';
import {
  InvalidSvgError,
  MAX_CUSTOM_SVG_BYTES,
  normalizeCustomSvg,
  readCustomSvgFile,
} from './customPattern';

const SVG_NS = 'xmlns="http://www.w3.org/2000/svg"';

function parse(svg: string): Element {
  return new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement;
}

describe('normalizeCustomSvg', () => {
  it('keeps the viewBox and sets an explicit size', () => {
    const result = parse(
      normalizeCustomSvg(`<svg ${SVG_NS} viewBox="0 0 100 50"><path d="M0 0H10"/></svg>`),
    );

    expect(result.getAttribute('viewBox')).toBe('0 0 100 50');
    expect(result.getAttribute('width')).toBe('24');
    expect(result.getAttribute('height')).toBe('24');
    expect(result.querySelector('path')).not.toBeNull();
  });

  it('derives a viewBox from width and height', () => {
    const result = parse(
      normalizeCustomSvg(
        `<svg ${SVG_NS} width="64px" height="32"><rect width="5" height="5"/></svg>`,
      ),
    );

    expect(result.getAttribute('viewBox')).toBe('0 0 64 32');
  });

  it('strips scripts and event handlers', () => {
    const result = normalizeCustomSvg(
      `<svg ${SVG_NS} viewBox="0 0 24 24" onload="alert(1)"><script>alert(2)</script><rect onclick="alert(3)" width="5" height="5"/></svg>`,
    );

    expect(result).not.toMatch(/script|onload|onclick|alert/);
  });

  it('rejects markup that is not an SVG', () => {
    expect(() => normalizeCustomSvg('<html><body/></html>')).toThrow(InvalidSvgError);
    expect(() => normalizeCustomSvg('not xml at all <')).toThrow(InvalidSvgError);
  });

  it('rejects an SVG without a size to scale from', () => {
    expect(() => normalizeCustomSvg(`<svg ${SVG_NS}><rect width="5" height="5"/></svg>`)).toThrow(
      /viewBox/,
    );
  });

  it('rejects an SVG over the size limit', () => {
    const padding = 'x'.repeat(MAX_CUSTOM_SVG_BYTES);
    expect(() =>
      normalizeCustomSvg(`<svg ${SVG_NS} viewBox="0 0 24 24"><desc>${padding}</desc></svg>`),
    ).toThrow(/larger than/);
  });
});

describe('readCustomSvgFile', () => {
  it('reads and normalises an uploaded file', async () => {
    const file = new File(
      [`<svg ${SVG_NS} viewBox="0 0 24 24"><circle r="4"/></svg>`],
      'icon.svg',
      {
        type: 'image/svg+xml',
      },
    );

    await expect(readCustomSvgFile(file)).resolves.toContain('<circle');
  });
});
