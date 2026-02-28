import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders with label', () => {
    render(<Textarea label="Message" />);
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<Textarea placeholder="Enter text..." />);
    expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
  });

  it('applies mono class', () => {
    render(<Textarea label="Code" mono />);
    const textarea = screen.getByLabelText('Code');
    expect(textarea.className).toContain('mono');
  });

  it('displays error message', () => {
    render(<Textarea label="Message" error="Too short" />);
    expect(screen.getByText('Too short')).toBeInTheDocument();
  });

  it('applies fullWidth class', () => {
    const { container } = render(<Textarea label="Test" fullWidth />);
    expect((container.firstChild as HTMLElement)?.className).toContain('fullWidth');
  });
});
