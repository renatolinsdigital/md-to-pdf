import { isValidElement } from 'react';
import { Document } from '@react-pdf/renderer';
import { describe, it, expect } from 'vitest';
import type { Root } from 'hast';
import { PdfDocument } from './PdfDocument';
import type { ConverterSettings } from '@domain/hooks/useConverterSettings';

// @react-pdf/renderer elements are PDF primitives, not DOM nodes, so this
// component can't be exercised with React Testing Library. Instead we verify
// it instantiates a valid, well-formed @react-pdf/renderer element tree.

const settings: ConverterSettings = {
  backgroundColor: '#FFFFFF',
  backgroundPattern: {
    patternId: 'none',
    opacity: 0.04,
    elementSize: 22,
    gap: 20,
    patternColor: '#000000',
  },
  margins: { top: 20, right: 20, bottom: 20, left: 20 },
  pageSize: 'A4',
  pageNumber: {
    enabled: true,
    pageLabel: 'Page',
    ofLabel: 'of',
    fontSize: 10,
  },
  textColor: '#000000',
  historySize: 50,
};

const emptyHastTree: Root = { type: 'root', children: [] };

describe('PdfDocument', () => {
  it('instantiates a valid react-pdf Document element', () => {
    const element = PdfDocument({ hastTree: emptyHastTree, settings, patternDataUrl: null });

    expect(isValidElement(element)).toBe(true);
    expect(element.type).toBe(Document);
  });
});
