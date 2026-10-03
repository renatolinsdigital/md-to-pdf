import type { RefObject } from 'react';
import type { IconType } from 'react-icons';
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
  FiCornerDownLeft,
} from 'react-icons/fi';
import { applyFormat, type FormatAction } from '@domain/helpers/applyFormat';
import { TextColorPopover } from './TextColorPopover';
import styles from './FormattingToolbar.module.scss';

interface FormattingToolbarProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  markdown: string;
  onMarkdownChange: (value: string) => void;
}

interface ToolbarItem {
  icon: IconType;
  label: string;
  shortLabel?: string;
  action: FormatAction;
}

interface ToolbarGroup {
  label: string;
  items: ToolbarItem[];
}

const wrap = (prefix: string, suffix = prefix): FormatAction => ({ type: 'wrap', prefix, suffix });
const linePrefix = (prefix: string): FormatAction => ({ type: 'linePrefix', prefix });
const insert = (text: string): FormatAction => ({ type: 'insert', text });
const alignBlock = (align: 'left' | 'center' | 'right') =>
  wrap(`<div style="text-align: ${align}">\n`, '\n</div>');
const colorSpan = (color: string) => wrap(`<span style="color: ${color}">`, '</span>');

const FORMATTING_GROUPS: ToolbarGroup[] = [
  {
    label: 'Text',
    items: [
      { icon: FiBold, label: 'Bold', action: wrap('**') },
      { icon: FiItalic, label: 'Italic', action: wrap('*') },
      { icon: FiMinus, label: 'Strikethrough', shortLabel: 'Strike', action: wrap('~~') },
    ],
  },
  {
    label: 'Headings',
    items: [
      { icon: FiType, label: 'Heading 1', shortLabel: 'H1', action: linePrefix('# ') },
      { icon: FiType, label: 'Heading 2', shortLabel: 'H2', action: linePrefix('## ') },
      { icon: FiType, label: 'Heading 3', shortLabel: 'H3', action: linePrefix('### ') },
    ],
  },
  {
    label: 'Lists',
    items: [
      { icon: FiList, label: 'Bullet List', shortLabel: 'UL', action: linePrefix('- ') },
      { icon: FiList, label: 'Numbered List', shortLabel: 'OL', action: linePrefix('1. ') },
    ],
  },
  {
    label: 'Code',
    items: [
      { icon: FiCode, label: 'Inline Code', action: wrap('`') },
      { icon: FiCode, label: 'Code Block', action: wrap('```\n', '\n```') },
    ],
  },
  {
    label: 'Insert',
    items: [
      { icon: FiLink, label: 'Link', action: wrap('[', '](https://example.com)') },
      { icon: FiImage, label: 'Image', action: wrap('![', '](https://example.com/image.png)') },
      {
        icon: FiType,
        label: 'Image Caption',
        shortLabel: 'Caption',
        action: wrap('<p style="text-align: center"><em>', '</em></p>'),
      },
    ],
  },
  {
    label: 'Blocks',
    items: [
      { icon: FiAlignLeft, label: 'Blockquote', shortLabel: 'Quote', action: linePrefix('> ') },
      { icon: FiMinus, label: 'Horizontal Rule', shortLabel: 'HR', action: insert('\n---\n') },
      { icon: FiCornerDownLeft, label: 'Line Break', shortLabel: 'BR', action: insert('<br>') },
    ],
  },
];

const ALIGNMENT_GROUP: ToolbarGroup = {
  label: 'Alignment',
  items: [
    {
      icon: FiAlignLeft,
      label: 'Align Left: wraps content in a container that aligns images and text to the left',
      shortLabel: '⬅ Left',
      action: alignBlock('left'),
    },
    {
      icon: FiAlignCenter,
      label: 'Align Center: wraps content in a container that centers images and text',
      shortLabel: '↔ Center',
      action: alignBlock('center'),
    },
    {
      icon: FiAlignRight,
      label: 'Align Right: wraps content in a container that aligns images and text to the right',
      shortLabel: '➡ Right',
      action: alignBlock('right'),
    },
  ],
};

export function FormattingToolbar({
  textareaRef,
  markdown,
  onMarkdownChange,
}: FormattingToolbarProps) {
  const applyAction = (action: FormatAction) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, scrollTop } = textarea;
    const { text, selection } = applyFormat(
      markdown,
      { start: selectionStart, end: selectionEnd },
      action,
    );
    onMarkdownChange(text);

    // Replacing the value moves the caret to the end, and focusing would then scroll
    // down to it - so restore both selection and scroll once React has committed.
    requestAnimationFrame(() => {
      textarea.focus({ preventScroll: true });
      textarea.setSelectionRange(selection.start, selection.end);
      textarea.scrollTop = scrollTop;
    });
  };

  const renderGroup = (group: ToolbarGroup) => (
    <div key={group.label} className={styles.group}>
      {group.items.map((item) => (
        <button
          key={item.label}
          className={styles.button}
          onClick={() => applyAction(item.action)}
          title={item.label}
          type="button"
        >
          <item.icon />
          <span className={styles.buttonLabel}>{item.shortLabel ?? item.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className={styles.toolbar}>
      <div className={styles.row}>{FORMATTING_GROUPS.map(renderGroup)}</div>
      <div className={styles.row}>
        {renderGroup(ALIGNMENT_GROUP)}
        <div className={styles.group}>
          <TextColorPopover onApply={(color) => applyAction(colorSpan(color))} />
        </div>
      </div>
    </div>
  );
}
