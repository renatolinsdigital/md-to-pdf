import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import type { KeyboardEvent } from 'react';
import { useUndoRedo } from './useUndoRedo';

function keyDown(key: string, modifiers: { shiftKey?: boolean } = {}) {
  return {
    key,
    ctrlKey: true,
    metaKey: false,
    preventDefault: vi.fn(),
    ...modifiers,
  } as unknown as KeyboardEvent;
}

function setup(initialText = '') {
  const setText = vi.fn();
  const { result } = renderHook(() => useUndoRedo(initialText, setText));
  return { result, setText };
}

describe('useUndoRedo', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('undoes and redoes a change with keyboard shortcuts', () => {
    const { result, setText } = setup('a');

    act(() => result.current.pushChange('ab'));
    act(() => result.current.handleKeyDown(keyDown('z')));
    expect(setText).toHaveBeenLastCalledWith('a');

    act(() => result.current.handleKeyDown(keyDown('z', { shiftKey: true })));
    expect(setText).toHaveBeenLastCalledWith('ab');
  });

  it('merges rapid consecutive edits into one undo step', () => {
    vi.useFakeTimers();
    const { result, setText } = setup('');

    act(() => result.current.pushChange('h'));
    act(() => result.current.pushChange('hi'));
    act(() => result.current.handleKeyDown(keyDown('z')));

    expect(setText).toHaveBeenLastCalledWith('');
  });

  it('keeps edits separated by a pause as separate steps', () => {
    vi.useFakeTimers();
    const { result, setText } = setup('');

    act(() => result.current.pushChange('h'));
    vi.advanceTimersByTime(1000);
    act(() => result.current.pushChange('hi'));
    act(() => result.current.handleKeyDown(keyDown('z')));

    expect(setText).toHaveBeenLastCalledWith('h');
  });

  it('ignores keys without Ctrl/Cmd', () => {
    const { result, setText } = setup('a');
    act(() => result.current.pushChange('ab'));
    setText.mockClear();

    act(() => result.current.handleKeyDown({ ...keyDown('z'), ctrlKey: false } as KeyboardEvent));

    expect(setText).not.toHaveBeenCalled();
  });
});
