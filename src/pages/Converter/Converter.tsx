import { useState, useRef, useEffect } from 'react';
import { FiDownload, FiMenu, FiX, FiFileText } from 'react-icons/fi';
import { Button } from '@shared/components/Button/Button';
import { readStorage, writeStorage } from '@shared/helpers/storage';
import { FormattingToolbar } from '@domain/components/FormattingToolbar/FormattingToolbar';
import { PdfSettingsPanel } from '@domain/components/PdfSettingsPanel/PdfSettingsPanel';
import { PdfCanvasViewer } from '@domain/components/PdfCanvasViewer/PdfCanvasViewer';
import { useConverterSettings } from '@domain/hooks/useConverterSettings';
import { useMarkdownParser } from '@domain/hooks/useMarkdownParser';
import { usePdfGenerator } from '@domain/hooks/usePdfGenerator';
import { useLivePdf } from '@domain/hooks/useLivePdf';
import { useUndoRedo } from '@domain/hooks/useUndoRedo';
import { EXAMPLE_MARKDOWN } from '@domain/helpers/exampleMarkdown';
import styles from './Converter.module.scss';

const STORAGE_KEY = 'md-to-pdf-markdown';

export function Converter() {
  const [markdown, setMarkdown] = useState(() => readStorage(STORAGE_KEY) ?? EXAMPLE_MARKDOWN);
  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {
    settings,
    updateSettings,
    updateMargins,
    updatePageNumber,
    updateBackgroundPattern,
    resetSettings,
  } = useConverterSettings();
  const { pushChange, resetHistory, handleKeyDown } = useUndoRedo(
    markdown,
    setMarkdown,
    settings.historySize,
  );
  const hastTree = useMarkdownParser(markdown);
  const { generatePdf, isGenerating } = usePdfGenerator();
  const { pdfBlob, isRendering } = useLivePdf(hastTree, settings);

  useEffect(() => {
    writeStorage(STORAGE_KEY, markdown);
  }, [markdown]);

  const closeSettings = () => setShowSettings(false);

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
            onClick={() => generatePdf(hastTree, settings)}
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
        onMarkdownChange={pushChange}
      />

      <div className={styles.workspace}>
        <div className={styles.editorPane}>
          <div className={styles.paneHeader}>
            <label className={styles.paneLabel}>Markdown</label>
            <button
              type="button"
              className={styles.exampleButton}
              onClick={() => resetHistory(EXAMPLE_MARKDOWN)}
              title="Load example markdown that showcases all features"
            >
              <FiFileText />
              Load Example
            </button>
          </div>
          <textarea
            ref={textareaRef}
            className={styles.editor}
            value={markdown}
            onChange={(e) => pushChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your markdown here..."
            spellCheck={false}
          />
        </div>

        <div className={styles.pdfPane}>
          <label className={styles.paneLabel}>PDF Preview</label>
          <PdfCanvasViewer blob={pdfBlob} isRendering={isRendering} />
        </div>
      </div>

      {showSettings && (
        <>
          <div className={styles.overlay} onClick={closeSettings} />
          <div className={styles.settingsDrawer}>
            <div className={styles.drawerHeader}>
              <div>
                <h2 className={styles.drawerTitle}>Settings</h2>
                <p className={styles.drawerHint}>Saved automatically in your browser</p>
              </div>
              <button
                type="button"
                className={styles.drawerClose}
                onClick={closeSettings}
                aria-label="Close settings"
              >
                <FiX />
              </button>
            </div>
            <PdfSettingsPanel
              settings={settings}
              onUpdateSettings={updateSettings}
              onUpdateMargins={updateMargins}
              onUpdatePageNumber={updatePageNumber}
              onUpdateBackgroundPattern={updateBackgroundPattern}
              onReset={resetSettings}
            />
          </div>
        </>
      )}
    </div>
  );
}
