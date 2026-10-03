import { Document, Page, Text, View, Image } from '@react-pdf/renderer';
import type { Root } from 'hast';
import type { ConverterSettings } from '@domain/hooks/useConverterSettings';
import { hastToReactPdf } from '@domain/helpers/hastToPdf';
import { mmToPt } from '@domain/helpers/units';
import { registerFonts } from '@domain/helpers/fontRegistration';

interface PdfDocumentProps {
  hastTree: Root;
  settings: ConverterSettings;
  /** Pre-rasterised PNG data-URL for the background pattern (or null). */
  patternDataUrl?: string | null;
}

/** Room reserved below the content for the page number. */
const PAGE_NUMBER_SPACE = 30;

registerFonts();

export function PdfDocument({ hastTree, settings, patternDataUrl }: PdfDocumentProps) {
  const { margins, pageNumber } = settings;
  const marginBottom = mmToPt(margins.bottom);

  return (
    <Document title="MD to PDF Document" author="MD to PDF Converter">
      <Page
        size={settings.pageSize}
        style={{
          backgroundColor: settings.backgroundColor,
          paddingTop: mmToPt(margins.top),
          paddingRight: mmToPt(margins.right),
          paddingBottom: marginBottom + (pageNumber.enabled ? PAGE_NUMBER_SPACE : 0),
          paddingLeft: mmToPt(margins.left),
          fontFamily: 'Roboto',
          fontSize: 12,
        }}
      >
        {/* Fixed, so the pattern repeats behind the content on every page */}
        {patternDataUrl ? (
          <View fixed style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <Image src={patternDataUrl} style={{ width: '100%', height: '100%' }} />
          </View>
        ) : null}

        <View>{hastToReactPdf(hastTree, settings.textColor)}</View>

        {pageNumber.enabled ? (
          <Text
            fixed
            style={{
              position: 'absolute',
              bottom: marginBottom / 2 + 4,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: pageNumber.fontSize,
              color: '#666666',
              fontFamily: 'Roboto',
            }}
            render={({ pageNumber: current, totalPages }) =>
              `${pageNumber.pageLabel} ${current} ${pageNumber.ofLabel} ${totalPages}`
            }
          />
        ) : null}
      </Page>
    </Document>
  );
}
