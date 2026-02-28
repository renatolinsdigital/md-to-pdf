import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Select } from './Select';

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
];

describe('Select', () => {
  it('renders all options', () => {
    render(<Select options={options} value="a" onChange={() => {}} />);
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getByText('Option C')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Select label="Size" options={options} value="a" onChange={() => {}} />);
    expect(screen.getByText('Size')).toBeInTheDocument();
  });

  it('selects the correct value', () => {
    render(<Select options={options} value="b" onChange={() => {}} />);
    const select = screen.getByRole('combobox');
    expect((select as HTMLSelectElement).value).toBe('b');
  });
});
