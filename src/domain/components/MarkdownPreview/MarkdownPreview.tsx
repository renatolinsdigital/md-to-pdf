import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { ConverterSettings } from '@domain/hooks/useConverterSettings';
import styles from './MarkdownPreview.module.scss';

interface MarkdownPreviewProps {
  markdown: string;
  settings: ConverterSettings;
}

export function MarkdownPreview({ markdown, settings }: MarkdownPreviewProps) {
  const containerStyle = {
    backgroundColor: settings.backgroundColor,
    color: settings.textColor,
    padding: `${settings.margins.top * 1.5}px ${settings.margins.right * 1.5}px ${settings.margins.bottom * 1.5 + 30}px ${settings.margins.left * 1.5}px`,
  };

  return (
    <div className={styles.previewContainer}>
      <div className={styles.previewLabel}>Preview</div>
      <div className={styles.preview} style={containerStyle}>
        <div className={styles.markdownContent}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const codeString = String(children).replace(/\n$/, '');

                if (match) {
                  return (
                    <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div">
                      {codeString}
                    </SyntaxHighlighter>
                  );
                }

                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {markdown}
          </ReactMarkdown>
        </div>

        {settings.pageNumber.enabled && (
          <div className={styles.pageNumber} style={{ fontSize: settings.pageNumber.fontSize }}>
            {settings.pageNumber.pageLabel} 1 {settings.pageNumber.ofLabel} 1
          </div>
        )}
      </div>
    </div>
  );
}
