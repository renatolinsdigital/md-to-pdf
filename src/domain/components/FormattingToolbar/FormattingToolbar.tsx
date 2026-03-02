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
  FiAlignCenter,
  FiAlignRight,
  FiDroplet,
  FiCheck,
  FiCornerDownLeft,
} from 'react-icons/fi';
import { HexColorPicker } from 'react-colorful';
import styles from './FormattingToolbar.module.scss';

const PRESET_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#1f2937',
  '#6b7280',
  '#ffffff',
  '#000000',
];

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

interface ToolbarGroup {
  label: string;
  items: ToolbarItem[];
}

const TOOLBAR_ROW1: ToolbarGroup[] = [
  {
    label: 'Text',
    items: [
      { icon: FiBold, label: 'Bold', actionType: 'bold' },
      { icon: FiItalic, label: 'Italic', actionType: 'italic' },
      { icon: FiMinus, label: 'Strikethrough', shortLabel: 'Strike', actionType: 'strikethrough' },
    ],
  },
  {
    label: 'Headings',
    items: [
      { icon: FiType, label: 'Heading 1', shortLabel: 'H1', actionType: 'h1' },
      { icon: FiType, label: 'Heading 2', shortLabel: 'H2', actionType: 'h2' },
      { icon: FiType, label: 'Heading 3', shortLabel: 'H3', actionType: 'h3' },
    ],
  },
  {
    label: 'Lists',
    items: [
      { icon: FiList, label: 'Bullet List', shortLabel: 'UL', actionType: 'ul' },
      { icon: FiList, label: 'Numbered List', shortLabel: 'OL', actionType: 'ol' },
    ],
  },
  {
    label: 'Code',
    items: [
      { icon: FiCode, label: 'Inline Code', actionType: 'inlineCode' },
      { icon: FiCode, label: 'Code Block', actionType: 'codeBlock' },
    ],
  },
  {
    label: 'Insert',
    items: [
      { icon: FiLink, label: 'Link', actionType: 'link' },
      { icon: FiImage, label: 'Image', actionType: 'image' },
      { icon: FiType, label: 'Image Caption', shortLabel: 'Caption', actionType: 'caption' },
    ],
  },
  {
    label: 'Blocks',
    items: [
      { icon: FiAlignLeft, label: 'Blockquote', shortLabel: 'Quote', actionType: 'blockquote' },
      { icon: FiMinus, label: 'Horizontal Rule', shortLabel: 'HR', actionType: 'hr' },
      { icon: FiCornerDownLeft, label: 'Line Break', shortLabel: 'BR', actionType: 'br' },
    ],
  },
];

const TOOLBAR_ROW2: ToolbarGroup[] = [
  {
    label: 'Alignment',
    items: [
      {
        icon: FiAlignLeft,
        label: 'Align Left: wraps content in a container that aligns images and text to the left',
        shortLabel: '⬅ Left',
        actionType: 'alignLeft',
      },
      {
        icon: FiAlignCenter,
        label: 'Align Center: wraps content in a container that centers images and text',
        shortLabel: '↔ Center',
        actionType: 'alignCenter',
      },
      {
        icon: FiAlignRight,
        label: 'Align Right: wraps content in a container that aligns images and text to the right',
        shortLabel: '➡ Right',
        actionType: 'alignRight',
      },
    ],
  },
];

export function FormattingToolbar({
  textareaRef,
  markdown,
  onMarkdownChange,
}: FormattingToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [textColorValue, setTextColorValue] = useState('#ef4444');
  const [hexInput, setHexInput] = useState('#ef4444');
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const handleColorChange = useCallback((color: string) => {
    setTextColorValue(color);
    setHexInput(color);
  }, []);

  const handleHexInput = useCallback((value: string) => {
    setHexInput(value);
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      setTextColorValue(value);
    }
  }, []);

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

  const insertAtCursor = useCallback(
    (text: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const pos = textarea.selectionStart;
      const before = markdown.substring(0, pos);
      const after = markdown.substring(pos);

      onMarkdownChange(`${before}${text}${after}`);

      requestAnimationFrame(() => {
        textarea.focus();
        const newPos = pos + text.length;
        textarea.setSelectionRange(newPos, newPos);
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
        case 'caption':
          wrapSelection('<p style="text-align: center"><em>', '</em></p>');
          break;
        case 'blockquote':
          insertAtLineStart('> ');
          break;
        case 'hr':
          insertAtCursor('\n---\n');
          break;
        case 'br':
          insertAtCursor('<br>');
          break;
        case 'alignLeft':
          wrapSelection('<div style="text-align: left">\n', '\n</div>');
          break;
        case 'alignCenter':
          wrapSelection('<div style="text-align: center">\n', '\n</div>');
          break;
        case 'alignRight':
          wrapSelection('<div style="text-align: right">\n', '\n</div>');
          break;
      }
    },
    [wrapSelection, insertAtLineStart, insertAtCursor],
  );

  return (
    <div className={styles.toolbar}>
      <div className={styles.row}>
        {TOOLBAR_ROW1.map((group) => (
          <div key={group.label} className={styles.group}>
            {group.items.map((item) => (
              <button
                key={item.actionType}
                className={styles.button}
                onClick={() => handleAction(item.actionType)}
                title={item.label}
                type="button"
              >
                <item.icon />
                <span className={styles.buttonLabel}>{item.shortLabel || item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className={styles.row}>
        {TOOLBAR_ROW2.map((group) => (
          <div key={group.label} className={styles.group}>
            {group.items.map((item) => (
              <button
                key={item.actionType}
                className={styles.button}
                onClick={() => handleAction(item.actionType)}
                title={item.label}
                type="button"
              >
                <item.icon />
                <span className={styles.buttonLabel}>{item.shortLabel || item.label}</span>
              </button>
            ))}
          </div>
        ))}

        <div className={styles.group}>
          <div className={styles.colorWrapper} ref={colorPickerRef}>
            <button
              className={styles.button}
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Apply color to selected text"
              type="button"
            >
              <FiDroplet />
              <span className={styles.colorIndicator} style={{ backgroundColor: textColorValue }} />
            </button>
            {showColorPicker && (
              <div className={styles.colorPopover}>
                <div className={styles.pickerHeader}>
                  <span>Text Color</span>
                  <div
                    className={styles.pickerPreview}
                    style={{ backgroundColor: textColorValue }}
                  />
                </div>
                <HexColorPicker color={textColorValue} onChange={handleColorChange} />
                <div className={styles.presets}>
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={styles.presetSwatch}
                      style={{ backgroundColor: c }}
                      onClick={() => handleColorChange(c)}
                      title={c}
                      aria-label={c}
                    >
                      {c === textColorValue && <FiCheck className={styles.presetCheck} />}
                    </button>
                  ))}
                </div>
                <div className={styles.hexRow}>
                  <span className={styles.hexHash}>#</span>
                  <input
                    className={styles.hexInput}
                    value={hexInput.replace('#', '')}
                    onChange={(e) => handleHexInput(`#${e.target.value}`)}
                    maxLength={6}
                    spellCheck={false}
                  />
                  <button
                    className={styles.applyColor}
                    onClick={() => insertColoredText(textColorValue)}
                    type="button"
                    title="Apply color to selection"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
