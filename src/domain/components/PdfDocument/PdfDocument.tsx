import React from 'react';
import { Document, Page, Text, View, Image } from '@react-pdf/renderer';
import type { Root } from 'hast';
import type { ConverterSettings } from '@domain/hooks/useConverterSettings';
import { hastToReactPdf, resetKeyCounter } from '@domain/helpers/hastToPdf';
import { mmToPt } from '@domain/helpers/parseInlineStyle';
import { registerFonts } from '@domain/helpers/fontRegistration';

interface PdfDocumentProps {
  hastTree: Root;
  settings: ConverterSettings;
  /** Pre-rasterised PNG data-URL for the background pattern (or null). */
  patternDataUrl?: string | null;
}

registerFonts();

export function PdfDocument({ hastTree, settings, patternDataUrl }: PdfDocumentProps) {
  resetKeyCounter();

  const marginTop = mmToPt(settings.margins.top);
  const marginRight = mmToPt(settings.margins.right);
  const marginBottom = mmToPt(settings.margins.bottom);
  const marginLeft = mmToPt(settings.margins.left);
  const footerSpace = settings.pageNumber.enabled ? 30 : 0;

  const pdfContent = hastToReactPdf(hastTree, settings.textColor);

  return React.createElement(
    Document,
    { title: 'MD to PDF Document', author: 'MD to PDF Converter' },
    React.createElement(
      Page,
      {
        size: settings.pageSize,
        style: {
          backgroundColor: settings.backgroundColor,
          paddingTop: marginTop,
          paddingRight: marginRight,
          paddingBottom: marginBottom + footerSpace,
          paddingLeft: marginLeft,
          fontFamily: 'Roboto',
          fontSize: 12,
        },
      },
      // Background pattern – fills the content area behind text on every page
      patternDataUrl
        ? React.createElement(
            View,
            {
              fixed: true,
              style: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              },
            },
            React.createElement(Image, {
              src: patternDataUrl,
              style: {
                width: '100%',
                height: '100%',
              },
            }),
          )
        : null,
      React.createElement(View, null, pdfContent),
      settings.pageNumber.enabled
        ? React.createElement(Text, {
            fixed: true,
            style: {
              position: 'absolute',
              bottom: marginBottom / 2 + 4,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: settings.pageNumber.fontSize,
              color: '#666666',
              fontFamily: 'Roboto',
            },
            render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
              `${settings.pageNumber.pageLabel} ${pageNumber} ${settings.pageNumber.ofLabel} ${totalPages}`,
          })
        : null,
    ),
  );
}
