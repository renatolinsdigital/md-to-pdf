import { useRef, useCallback, useEffect, type KeyboardEvent } from 'react';

/**
 * Minimal diff between two strings: only the changed region between their
 * common prefix and suffix is stored.
 */
interface Diff {
  /** Start index where the change begins */
  start: number;
  /** The removed text (from old string) */
  removed: string;
  /** The inserted text (from new string) */
  inserted: string;
}

function computeDiff(oldStr: string, newStr: string): Diff {
  const minLen = Math.min(oldStr.length, newStr.length);

  let prefixLen = 0;
  while (prefixLen < minLen && oldStr[prefixLen] === newStr[prefixLen]) {
    prefixLen++;
  }

  // The suffix must not overlap the prefix
  let suffixLen = 0;
  const maxSuffix = minLen - prefixLen;
  while (
    suffixLen < maxSuffix &&
    oldStr[oldStr.length - 1 - suffixLen] === newStr[newStr.length - 1 - suffixLen]
  ) {
    suffixLen++;
  }

  return {
    start: prefixLen,
    removed: oldStr.slice(prefixLen, oldStr.length - suffixLen),
    inserted: newStr.slice(prefixLen, newStr.length - suffixLen),
  };
}

/** Re-applies a diff, or reverts it when `reverse` is set. */
function applyDiff(text: string, diff: Diff, reverse: boolean): string {
  const [from, to] = reverse ? [diff.inserted, diff.removed] : [diff.removed, diff.inserted];
  return text.slice(0, diff.start) + to + text.slice(diff.start + from.length);
}

/** Consecutive edits closer together than this become a single undo step. */
const MERGE_WINDOW_MS = 400;

export function useUndoRedo(
  initialText: string,
  setText: (value: string) => void,
  maxHistory = 50,
) {
  const undoStack = useRef<Diff[]>([]);
  const redoStack = useRef<Diff[]>([]);
  const lastTextRef = useRef(initialText);
  const lastEditTime = useRef(0);
  const maxHistoryRef = useRef(maxHistory);

  useEffect(() => {
    maxHistoryRef.current = maxHistory;

    // Trim stacks when maxHistory decreases
    for (const stack of [undoStack.current, redoStack.current]) {
      if (stack.length > maxHistory) stack.splice(0, stack.length - maxHistory);
    }
  }, [maxHistory]);

  /** Records a change to the text (typing or toolbar action) and applies it. */
  const pushChange = useCallback(
    (newText: string) => {
      const oldText = lastTextRef.current;
      if (newText === oldText) return;

      const now = Date.now();
      const undo = undoStack.current;
      const previous = undo[undo.length - 1];

      if (previous && now - lastEditTime.current < MERGE_WINDOW_MS) {
        // Fold into the previous step: diff from the text as it was before that step
        undo[undo.length - 1] = computeDiff(applyDiff(oldText, previous, true), newText);
      } else {
        undo.push(computeDiff(oldText, newText));
        if (undo.length > maxHistoryRef.current) undo.shift();
      }

      lastEditTime.current = now;
      // Any new change invalidates the redo stack
      redoStack.current = [];
      lastTextRef.current = newText;
      setText(newText);
    },
    [setText],
  );

  const undo = useCallback(() => {
    const diff = undoStack.current.pop();
    if (!diff) return;
    redoStack.current.push(diff);
    lastTextRef.current = applyDiff(lastTextRef.current, diff, true);
    setText(lastTextRef.current);
  }, [setText]);

  const redo = useCallback(() => {
    const diff = redoStack.current.pop();
    if (!diff) return;
    undoStack.current.push(diff);
    lastTextRef.current = applyDiff(lastTextRef.current, diff, false);
    setText(lastTextRef.current);
  }, [setText]);

  /** Replaces the text and clears history (e.g. when loading the example). */
  const resetHistory = useCallback(
    (newText: string) => {
      undoStack.current = [];
      redoStack.current = [];
      lastTextRef.current = newText;
      lastEditTime.current = 0;
      setText(newText);
    },
    [setText],
  );

  /** Ctrl/Cmd+Z undoes; Ctrl/Cmd+Shift+Z and Ctrl/Cmd+Y redo. */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (!(e.ctrlKey || e.metaKey) || (key !== 'z' && key !== 'y')) return;

      e.preventDefault();
      if (key === 'z' && !e.shiftKey) undo();
      else redo();
    },
    [undo, redo],
  );

  return { pushChange, resetHistory, handleKeyDown };
}
