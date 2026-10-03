export type FormatAction =
  /** Surround the selection, e.g. `**bold**` - or unwrap it when it's already surrounded. */
  | { type: 'wrap'; prefix: string; suffix: string }
  /** Prepend to the line holding the caret, e.g. `# ` for a heading - or remove it when present. */
  | { type: 'linePrefix'; prefix: string }
  /** Insert at the caret, e.g. `<br>`. */
  | { type: 'insert'; text: string };

type WrapAction = Extract<FormatAction, { type: 'wrap' }>;

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

/** Length of the unbroken run of `char` that touches `index` from either side. */
function runLength(text: string, index: number, char: string): number {
  let from = index;
  while (from > 0 && text[from - 1] === char) from--;
  let to = index;
  while (to < text.length && text[to] === char) to++;
  return to - from;
}

/**
 * `*` and `**` share a character, so `**bold**` must not read as italic wrapped in stray
 * asterisks. A run of three (`***bold italic***`) holds both markers.
 */
function isWholeMarker(text: string, content: TextSelection, marker: string): boolean {
  const char = marker.charAt(0);
  if (marker !== char.repeat(marker.length)) return true;

  const run = Math.min(runLength(text, content.start, char), runLength(text, content.end, char));
  return run === marker.length || run === 3;
}

/**
 * The span between the markers when the selection is already wrapped in them, whether the
 * markers sit just outside the selection (`**|bold|**`) or inside it (`|**bold**|`).
 */
function findWrappedContent(
  text: string,
  { start, end }: TextSelection,
  { prefix, suffix }: WrapAction,
): TextSelection | undefined {
  const candidates: TextSelection[] = [
    { start, end },
    { start: start + prefix.length, end: end - suffix.length },
  ];

  return candidates.find(
    (content) =>
      content.start <= content.end &&
      text.endsWith(prefix, content.start) &&
      text.startsWith(suffix, content.end) &&
      (prefix !== suffix || isWholeMarker(text, content, prefix)),
  );
}

export function applyFormat(
  text: string,
  { start, end }: TextSelection,
  action: FormatAction,
): FormatResult {
  switch (action.type) {
    case 'wrap': {
      const content = findWrappedContent(text, { start, end }, action);
      if (content) {
        const inner = text.slice(content.start, content.end);
        const outerStart = content.start - action.prefix.length;
        return {
          text: text.slice(0, outerStart) + inner + text.slice(content.end + action.suffix.length),
          selection: { start: outerStart, end: outerStart + inner.length },
        };
      }

      const inner = text.slice(start, end) || PLACEHOLDER;
      const innerStart = start + action.prefix.length;
      return {
        text: text.slice(0, start) + action.prefix + inner + action.suffix + text.slice(end),
        selection: { start: innerStart, end: innerStart + inner.length },
      };
    }

    case 'linePrefix': {
      const lineStart = start === 0 ? 0 : text.lastIndexOf('\n', start - 1) + 1;

      if (text.startsWith(action.prefix, lineStart)) {
        const caret = Math.max(lineStart, start - action.prefix.length);
        return {
          text: text.slice(0, lineStart) + text.slice(lineStart + action.prefix.length),
          selection: { start: caret, end: caret },
        };
      }

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
