import { useRef, useCallback, useEffect } from 'react';

/**
 * Minimal diff between two strings.
 * Finds the common prefix and suffix, then stores only the changed region.
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
  // Find common prefix length
  let prefixLen = 0;
  const minLen = Math.min(oldStr.length, newStr.length);
  while (prefixLen < minLen && oldStr[prefixLen] === newStr[prefixLen]) {
    prefixLen++;
  }

  // Find common suffix length (not overlapping with prefix)
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

function applyDiff(text: string, diff: Diff, reverse: boolean): string {
  if (reverse) {
    // Undo: remove the inserted text, put back the removed text
    return text.slice(0, diff.start) + diff.removed + text.slice(diff.start + diff.inserted.length);
  }
  // Redo: remove the removed text, put back the inserted text
  return text.slice(0, diff.start) + diff.inserted + text.slice(diff.start + diff.removed.length);
}

/**
 * Debounce interval (ms) - sequential small edits within this
 * window are merged into a single undo entry.
 */
const MERGE_WINDOW = 400;

export function useUndoRedo(
  currentText: string,
  setText: (value: string) => void,
  maxHistory = 50,
) {
  const undoStack = useRef<Diff[]>([]);
  const redoStack = useRef<Diff[]>([]);
  const lastTextRef = useRef(currentText);
  const lastEditTime = useRef(0);
  const maxHistoryRef = useRef(maxHistory);

  useEffect(() => {
    maxHistoryRef.current = maxHistory;

    // Trim stacks when maxHistory decreases
    if (undoStack.current.length > maxHistory) {
      undoStack.current.splice(0, undoStack.current.length - maxHistory);
    }
    if (redoStack.current.length > maxHistory) {
      redoStack.current.splice(0, redoStack.current.length - maxHistory);
    }
  }, [maxHistory]);

  /**
   * Call this whenever the markdown changes (via typing or toolbar actions).
   * It computes a diff and pushes it onto the undo stack.
   */
  const pushChange = useCallback(
    (newText: string) => {
      const oldText = lastTextRef.current;
      if (newText === oldText) {
        setText(newText);
        return;
      }

      const diff = computeDiff(oldText, newText);
      const now = Date.now();

      // Merge consecutive small edits within the debounce window
      if (now - lastEditTime.current < MERGE_WINDOW && undoStack.current.length > 0) {
        const prev = undoStack.current[undoStack.current.length - 1]!;
        // Merge: recompute diff from the state *before* the previous diff
        const originalText = applyDiff(oldText, prev, true);
        const merged = computeDiff(originalText, newText);
        undoStack.current[undoStack.current.length - 1] = merged;
      } else {
        undoStack.current.push(diff);
        if (undoStack.current.length > maxHistoryRef.current) {
          undoStack.current.shift();
        }
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
    if (undoStack.current.length === 0) return;
    const diff = undoStack.current.pop()!;
    const restored = applyDiff(lastTextRef.current, diff, true);
    redoStack.current.push(diff);
    lastTextRef.current = restored;
    setText(restored);
  }, [setText]);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    const diff = redoStack.current.pop()!;
    const restored = applyDiff(lastTextRef.current, diff, false);
    undoStack.current.push(diff);
    lastTextRef.current = restored;
    setText(restored);
  }, [setText]);

  /**
   * Reset history (e.g. when loading example markdown).
   */
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

  return { pushChange, undo, redo, resetHistory };
}
