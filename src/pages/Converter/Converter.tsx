import { useState, useRef, useCallback, useEffect } from 'react';
import { FiDownload, FiMenu, FiX, FiLoader } from 'react-icons/fi';
import { Button } from '@shared/components/Button/Button';
import { FormattingToolbar } from '@domain/components/FormattingToolbar/FormattingToolbar';
import { PdfSettingsPanel } from '@domain/components/PdfSettingsPanel/PdfSettingsPanel';
import { useConverterSettings } from '@domain/hooks/useConverterSettings';
import { useMarkdownParser } from '@domain/hooks/useMarkdownParser';
import { usePdfGenerator } from '@domain/hooks/usePdfGenerator';
import { useLivePdf } from '@domain/hooks/useLivePdf';
import { DEFAULT_MARKDOWN } from '@domain/helpers/defaultMarkdown';
import styles from './Converter.module.scss';

export function Converter() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { settings, updateSettings, updateMargins, updatePageNumber } = useConverterSettings();
  const hastTree = useMarkdownParser(markdown);
  const { generatePdf, isGenerating } = usePdfGenerator();
  const { pdfUrl, isRendering } = useLivePdf(hastTree, settings);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const scrollPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Save scroll position from the current iframe before a new PDF loads
  useEffect(() => {
    if (isRendering && iframeRef.current) {
      try {
        const inner = iframeRef.current.contentWindow;
        if (inner) {
          scrollPosRef.current = { x: inner.scrollX ?? 0, y: inner.scrollY ?? 0 };
        }
      } catch {
        // cross-origin guard — ignore
      }
    }
  }, [isRendering]);

  // Restore scroll position after iframe loads the new PDF
  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const inner = iframe.contentWindow;
      if (inner && (scrollPosRef.current.x || scrollPosRef.current.y)) {
        // Small delay lets the PDF viewer initialise its layout before scrolling
        requestAnimationFrame(() => {
          inner.scrollTo(scrollPosRef.current.x, scrollPosRef.current.y);
        });
      }
    } catch {
      // cross-origin guard — ignore
    }
  }, []);

  const handleGenerate = () => {
    generatePdf(hastTree, settings);
  };

  const closeOverlay = useCallback(() => setShowSettings(false), []);

  return (
    <div className={styles.converter}>
      <div className={styles.header}>
        <h1 className={styles.title}>Markdown to PDF</h1>
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
            <FiMenu />
            Settings
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating || !markdown.trim()}
          >
            <FiDownload />
            {isGenerating ? 'Generating...' : 'Download PDF'}
          </Button>
        </div>
      </div>

      <FormattingToolbar
        textareaRef={textareaRef}
        markdown={markdown}
        onMarkdownChange={setMarkdown}
      />

      <div className={styles.workspace}>
        <div className={styles.editorPane}>
          <label className={styles.paneLabel}>Markdown</label>
          <textarea
            ref={textareaRef}
            className={styles.editor}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Enter your markdown here..."
            spellCheck={false}
          />
        </div>

        <div className={`${styles.pdfPane} ${isRendering ? styles.pdfRendering : ''}`}>
          <label className={styles.paneLabel}>
            PDF Preview
            {isRendering && <FiLoader className={styles.spinner} />}
          </label>
          {pdfUrl ? (
            <iframe
              ref={iframeRef}
              key={pdfUrl}
              className={styles.pdfViewer}
              src={`${pdfUrl}#toolbar=0`}
              title="Live PDF Preview"
              onLoad={handleIframeLoad}
            />
          ) : (
            <div className={styles.pdfPlaceholder}>
              {isRendering ? 'Generating PDF…' : 'Start typing to see a live PDF preview'}
            </div>
          )}
        </div>
      </div>

      {/* Settings overlay */}
      {showSettings && (
        <>
          <div className={styles.overlay} onClick={closeOverlay} />
          <div className={styles.settingsDrawer}>
            <div className={styles.drawerHeader}>
              <h2 className={styles.drawerTitle}>Settings</h2>
              <button className={styles.drawerClose} onClick={closeOverlay}>
                <FiX />
              </button>
            </div>
            <PdfSettingsPanel
              settings={settings}
              onUpdateSettings={updateSettings}
              onUpdateMargins={updateMargins}
              onUpdatePageNumber={updatePageNumber}
            />
          </div>
        </>
      )}
    </div>
  );
}
