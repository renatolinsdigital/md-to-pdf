import { useState, useRef } from 'react';
import { FiDownload, FiSettings, FiX } from 'react-icons/fi';
import { Button } from '@shared/components/Button/Button';
import { FormattingToolbar } from '@domain/components/FormattingToolbar/FormattingToolbar';
import { MarkdownPreview } from '@domain/components/MarkdownPreview/MarkdownPreview';
import { PdfSettingsPanel } from '@domain/components/PdfSettingsPanel/PdfSettingsPanel';
import { useConverterSettings } from '@domain/hooks/useConverterSettings';
import { useMarkdownParser } from '@domain/hooks/useMarkdownParser';
import { usePdfGenerator } from '@domain/hooks/usePdfGenerator';
import { DEFAULT_MARKDOWN } from '@domain/helpers/defaultMarkdown';
import styles from './Converter.module.scss';

export function Converter() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { settings, updateSettings, updateMargins, updatePageNumber } = useConverterSettings();
  const hastTree = useMarkdownParser(markdown);
  const { generatePdf, isGenerating } = usePdfGenerator();

  const handleGenerate = () => {
    generatePdf(hastTree, settings);
  };

  return (
    <div className={styles.converter}>
      <div className={styles.header}>
        <h1 className={styles.title}>Markdown to PDF</h1>
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
            {showSettings ? <FiX /> : <FiSettings />}
            {showSettings ? 'Close' : 'Settings'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating || !markdown.trim()}
          >
            <FiDownload />
            {isGenerating ? 'Generating...' : 'Generate PDF'}
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

        <div className={styles.previewPane}>
          <MarkdownPreview markdown={markdown} settings={settings} />
        </div>

        {showSettings && (
          <div className={styles.settingsPane}>
            <PdfSettingsPanel
              settings={settings}
              onUpdateSettings={updateSettings}
              onUpdateMargins={updateMargins}
              onUpdatePageNumber={updatePageNumber}
            />
          </div>
        )}
      </div>
    </div>
  );
}
