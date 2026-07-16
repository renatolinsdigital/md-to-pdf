import { useRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { FormattingToolbar } from './FormattingToolbar';

function Harness() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [markdown, setMarkdown] = useState('');

  return (
    <div>
      <FormattingToolbar
        textareaRef={textareaRef}
        markdown={markdown}
        onMarkdownChange={setMarkdown}
      />
      <textarea ref={textareaRef} value={markdown} onChange={(e) => setMarkdown(e.target.value)} />
    </div>
  );
}

describe('FormattingToolbar', () => {
  it('renders the formatting actions', () => {
    render(<Harness />);
    expect(screen.getByRole('button', { name: /bold/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /italic/i })).toBeInTheDocument();
    expect(screen.getByTitle('Bullet List')).toBeInTheDocument();
  });

  it('wraps the current selection when a formatting action is applied', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    await user.type(textarea, 'hello world');
    textarea.setSelectionRange(0, 5);

    await user.click(screen.getByRole('button', { name: /bold/i }));

    expect(textarea.value).toBe('**hello** world');
  });
});
