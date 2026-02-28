import { type RefObject, useState, useCallback, useRef, useEffect } from 'react';
import {
  FiBold,
  FiItalic,
  FiType,
  FiList,
  FiCode,
  FiLink,
  FiImage,
  FiMinus,
  FiAlignLeft,
  FiDroplet,
} from 'react-icons/fi';
import { ColorPicker } from '@shared/components/ColorPicker/ColorPicker';
import styles from './FormattingToolbar.module.scss';

interface FormattingToolbarProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  markdown: string;
  onMarkdownChange: (value: string) => void;
}

interface ToolbarItem {
  icon: React.ComponentType;
  label: string;
  actionType: string;
  shortLabel?: string;
}

const TOOLBAR_ITEMS: ToolbarItem[] = [
  { icon: FiBold, label: 'Bold', actionType: 'bold' },
  { icon: FiItalic, label: 'Italic', actionType: 'italic' },
  { icon: FiMinus, label: 'Strikethrough', shortLabel: 'Strike', actionType: 'strikethrough' },
  { icon: FiType, label: 'Heading 1', shortLabel: 'H1', actionType: 'h1' },
  { icon: FiType, label: 'Heading 2', shortLabel: 'H2', actionType: 'h2' },
  { icon: FiType, label: 'Heading 3', shortLabel: 'H3', actionType: 'h3' },
  { icon: FiList, label: 'Bullet List', shortLabel: 'UL', actionType: 'ul' },
  { icon: FiList, label: 'Numbered List', shortLabel: 'OL', actionType: 'ol' },
  { icon: FiCode, label: 'Inline Code', actionType: 'inlineCode' },
  { icon: FiCode, label: 'Code Block', actionType: 'codeBlock' },
  { icon: FiLink, label: 'Link', actionType: 'link' },
  { icon: FiImage, label: 'Image', actionType: 'image' },
  { icon: FiAlignLeft, label: 'Blockquote', shortLabel: 'Quote', actionType: 'blockquote' },
  { icon: FiMinus, label: 'Horizontal Rule', shortLabel: 'HR', actionType: 'hr' },
];

export function FormattingToolbar({
  textareaRef,
  markdown,
  onMarkdownChange,
}: FormattingToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [textColorValue, setTextColorValue] = useState('#ef4444');
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
    }
    if (showColorPicker) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showColorPicker]);

  const wrapSelection = useCallback(
    (prefix: string, suffix: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = markdown.substring(start, end);
      const before = markdown.substring(0, start);
      const after = markdown.substring(end);

      const newText = `${before}${prefix}${selected || 'text'}${suffix}${after}`;
      onMarkdownChange(newText);

      // Restore focus and selection
      requestAnimationFrame(() => {
        textarea.focus();
        const newStart = start + prefix.length;
        const newEnd = selected ? newStart + selected.length : newStart + 4; // "text" length
        textarea.setSelectionRange(newStart, newEnd);
      });
    },
    [textareaRef, markdown, onMarkdownChange],
  );

  const insertAtLineStart = useCallback(
    (prefix: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const lineStart = markdown.lastIndexOf('\n', start - 1) + 1;
      const before = markdown.substring(0, lineStart);
      const after = markdown.substring(lineStart);

      const newText = `${before}${prefix}${after}`;
      onMarkdownChange(newText);

      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, start + prefix.length);
      });
    },
    [textareaRef, markdown, onMarkdownChange],
  );

  const insertColoredText = useCallback(
    (color: string) => {
      wrapSelection(`<span style="color: ${color}">`, '</span>');
      setShowColorPicker(false);
    },
    [wrapSelection],
  );

  const handleAction = useCallback(
    (actionType: string) => {
      switch (actionType) {
        case 'bold':
          wrapSelection('**', '**');
          break;
        case 'italic':
          wrapSelection('*', '*');
          break;
        case 'strikethrough':
          wrapSelection('~~', '~~');
          break;
        case 'h1':
          insertAtLineStart('# ');
          break;
        case 'h2':
          insertAtLineStart('## ');
          break;
        case 'h3':
          insertAtLineStart('### ');
          break;
        case 'ul':
          insertAtLineStart('- ');
          break;
        case 'ol':
          insertAtLineStart('1. ');
          break;
        case 'inlineCode':
          wrapSelection('`', '`');
          break;
        case 'codeBlock':
          wrapSelection('```\n', '\n```');
          break;
        case 'link':
          wrapSelection('[', '](https://example.com)');
          break;
        case 'image':
          wrapSelection('![', '](https://example.com/image.png)');
          break;
        case 'blockquote':
          insertAtLineStart('> ');
          break;
        case 'hr': {
          const textarea = textareaRef.current;
          if (!textarea) return;
          const start = textarea.selectionStart;
          const before = markdown.substring(0, start);
          const after = markdown.substring(start);
          onMarkdownChange(`${before}\n---\n${after}`);
          break;
        }
      }
    },
    [wrapSelection, insertAtLineStart, textareaRef, markdown, onMarkdownChange],
  );

  return (
    <div className={styles.toolbar}>
      <div className={styles.items}>
        {TOOLBAR_ITEMS.map((item) => (
          <button
            key={item.label}
            className={styles.button}
            onClick={() => handleAction(item.actionType)}
            title={item.label}
            type="button"
          >
            <item.icon />
            <span className={styles.buttonLabel}>{item.shortLabel || item.label}</span>
          </button>
        ))}

        <div className={styles.colorWrapper} ref={colorPickerRef}>
          <button
            className={styles.button}
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Text Color"
            type="button"
          >
            <FiDroplet />
            <span className={styles.colorIndicator} style={{ backgroundColor: textColorValue }} />
          </button>
          {showColorPicker && (
            <div className={styles.colorPopover}>
              <ColorPicker color={textColorValue} onChange={setTextColorValue} />
              <button
                className={styles.applyColor}
                onClick={() => insertColoredText(textColorValue)}
                type="button"
              >
                Apply Color
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
