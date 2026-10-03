/**
 * Validation for user-uploaded SVG icons used as a background pattern.
 *
 * The cleaned markup is stored with the settings in localStorage, so it is
 * capped in size and normalised once on upload rather than on every render.
 */

export const CUSTOM_PATTERN_ID = 'custom';

/** Keeps the stored settings well inside the ~5 MB localStorage quota. */
export const MAX_CUSTOM_SVG_BYTES = 100 * 1024;

/** Rendered size given to the icon; it is scaled to the chosen element size when drawn. */
const ICON_SIZE = 24;

export class InvalidSvgError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSvgError';
  }
}

function resolveViewBox(svg: Element): string | null {
  const viewBox = svg.getAttribute('viewBox');
  if (viewBox) return viewBox;

  const width = parseFloat(svg.getAttribute('width') ?? '');
  const height = parseFloat(svg.getAttribute('height') ?? '');
  return width > 0 && height > 0 ? `0 0 ${width} ${height}` : null;
}

/**
 * Checks that `source` is a usable SVG and returns it normalised: scripts and
 * event handlers removed, and an explicit size set, because browsers can't
 * draw an SVG without an intrinsic size onto a canvas.
 */
export function normalizeCustomSvg(source: string): string {
  if (new Blob([source]).size > MAX_CUSTOM_SVG_BYTES) {
    throw new InvalidSvgError(`The SVG is larger than ${MAX_CUSTOM_SVG_BYTES / 1024} KB.`);
  }

  const doc = new DOMParser().parseFromString(source, 'image/svg+xml');
  const svg = doc.documentElement;
  if (doc.querySelector('parsererror') || svg.localName !== 'svg') {
    throw new InvalidSvgError('The file is not a valid SVG.');
  }

  const viewBox = resolveViewBox(svg);
  if (!viewBox) {
    throw new InvalidSvgError('The SVG needs a viewBox or a width and height.');
  }

  // Only ever drawn as an image, where scripts can't run; stripped so the stored markup stays inert
  svg.querySelectorAll('script, foreignObject').forEach((el) => el.remove());
  for (const el of [svg, ...svg.querySelectorAll('*')]) {
    for (const attr of [...el.attributes]) {
      if (attr.name.toLowerCase().startsWith('on')) el.removeAttribute(attr.name);
    }
  }

  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('width', String(ICON_SIZE));
  svg.setAttribute('height', String(ICON_SIZE));

  return new XMLSerializer().serializeToString(svg);
}

/** Reads an uploaded file and returns its normalised SVG markup. */
export async function readCustomSvgFile(file: File): Promise<string> {
  if (file.size > MAX_CUSTOM_SVG_BYTES) {
    throw new InvalidSvgError(`The SVG is larger than ${MAX_CUSTOM_SVG_BYTES / 1024} KB.`);
  }
  return normalizeCustomSvg(await file.text());
}
