import { isValidElement } from 'react';
import { Document } from '@react-pdf/renderer';
import { describe, it, expect } from 'vitest';
import type { Root } from 'hast';
import { PdfDocument } from './PdfDocument';
import { DEFAULT_SETTINGS } from '@domain/hooks/useConverterSettings';

// @react-pdf/renderer elements are PDF primitives, not DOM nodes, so this
// component can't be exercised with React Testing Library. Instead we verify
// it instantiates a valid, well-formed @react-pdf/renderer element tree.

const emptyHastTree: Root = { type: 'root', children: [] };

describe('PdfDocument', () => {
  it('instantiates a valid react-pdf Document element', () => {
    const element = PdfDocument({
      hastTree: emptyHastTree,
      settings: DEFAULT_SETTINGS,
      patternDataUrl: null,
    });

    expect(isValidElement(element)).toBe(true);
    expect(element.type).toBe(Document);
  });
});
