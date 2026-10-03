export type FormatAction =
  /** Surround the selection, e.g. `**bold**`. */
  | { type: 'wrap'; prefix: string; suffix: string }
  /** Prepend to the line holding the caret, e.g. `# ` for a heading. */
  | { type: 'linePrefix'; prefix: string }
  /** Insert at the caret, e.g. `<br>`. */
  | { type: 'insert'; text: string };

export interface TextSelection {
  start: number;
  end: number;
}

export interface FormatResult {
  text: string;
  /** Where the selection should be once the new text is in place. */
  selection: TextSelection;
}

/** Inserted (and selected, so it can be typed over) when wrapping an empty selection. */
const PLACEHOLDER = 'text';

export function applyFormat(
  text: string,
  { start, end }: TextSelection,
  action: FormatAction,
): FormatResult {
  switch (action.type) {
    case 'wrap': {
      const inner = text.slice(start, end) || PLACEHOLDER;
      const innerStart = start + action.prefix.length;
      return {
        text: text.slice(0, start) + action.prefix + inner + action.suffix + text.slice(end),
        selection: { start: innerStart, end: innerStart + inner.length },
      };
    }

    case 'linePrefix': {
      const lineStart = start === 0 ? 0 : text.lastIndexOf('\n', start - 1) + 1;
      const caret = start + action.prefix.length;
      return {
        text: text.slice(0, lineStart) + action.prefix + text.slice(lineStart),
        selection: { start: caret, end: caret },
      };
    }

    case 'insert': {
      const caret = start + action.text.length;
      return {
        text: text.slice(0, start) + action.text + text.slice(start),
        selection: { start: caret, end: caret },
      };
    }
  }
}
