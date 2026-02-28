import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ColorPicker } from './ColorPicker';

describe('ColorPicker', () => {
  it('renders the swatch button', () => {
    render(<ColorPicker color="#ff0000" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /pick color/i })).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<ColorPicker color="#ff0000" onChange={() => {}} label="Background" />);
    expect(screen.getByText('Background')).toBeInTheDocument();
  });

  it('shows the swatch with correct background color', () => {
    render(<ColorPicker color="#ff0000" onChange={() => {}} />);
    const swatch = screen.getByRole('button', { name: /pick color/i });
    expect(swatch.style.backgroundColor).toBe('rgb(255, 0, 0)');
  });

  it('opens popover on click', async () => {
    const user = userEvent.setup();
    render(<ColorPicker color="#ff0000" onChange={() => {}} />);
    await user.click(screen.getByRole('button', { name: /pick color/i }));
    expect(screen.getByPlaceholderText('#000000')).toBeInTheDocument();
  });

  it('calls onChange for valid hex input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker color="#ff0000" onChange={onChange} />);

    // Open the popover
    await user.click(screen.getByRole('button', { name: /pick color/i }));

    const input = screen.getByPlaceholderText('#000000');
    await user.clear(input);
    await user.type(input, '#00ff00');

    expect(onChange).toHaveBeenCalledWith('#00ff00');
  });
});
