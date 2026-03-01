import { useState, useRef, useCallback } from 'react';
import { FiDownload, FiMenu, FiX } from 'react-icons/fi';
import { Button } from '@shared/components/Button/Button';
import { FormattingToolbar } from '@domain/components/FormattingToolbar/FormattingToolbar';
import { PdfSettingsPanel } from '@domain/components/PdfSettingsPanel/PdfSettingsPanel';
import { PdfCanvasViewer } from '@domain/components/PdfCanvasViewer/PdfCanvasViewer';
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
  const { pdfBlob, isRendering } = useLivePdf(hastTree, settings);

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

        <div className={styles.pdfPane}>
          <label className={styles.paneLabel}>PDF Preview</label>
          <PdfCanvasViewer blob={pdfBlob} isRendering={isRendering} />
        </div>
      </div>

      {/* Settings overlay */}
      {showSettings && (
        <>
          <div className={styles.overlay} onClick={closeOverlay} />
          <div className={styles.settingsDrawer}>
            <div className={styles.drawerHeader}>
              <div>
                <h2 className={styles.drawerTitle}>Settings</h2>
                <p className={styles.drawerHint}>Saved automatically in your browser</p>
              </div>
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
