import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<Input placeholder="Type..." />);
    expect(screen.getByPlaceholderText('Type...')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<Input label="Email" error="Required" />);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('applies error styling', () => {
    render(<Input label="Email" error="Required" />);
    const input = screen.getByLabelText('Email');
    expect(input.className).toContain('inputError');
  });

  it('handles value changes', async () => {
    const user = userEvent.setup();
    let value = '';
    render(
      <Input
        label="Name"
        value={value}
        onChange={(e) => {
          value = e.target.value;
        }}
      />,
    );
    await user.type(screen.getByLabelText('Name'), 'John');
    expect(value).toBe('n'); // last char from controlled component
  });

  it('applies fullWidth class', () => {
    const { container } = render(<Input label="Test" fullWidth />);
    expect((container.firstChild as HTMLElement)?.className).toContain('fullWidth');
  });
});
