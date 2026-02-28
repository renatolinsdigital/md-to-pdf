import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Slider } from './Slider';

describe('Slider', () => {
  it('renders with label and value', () => {
    render(<Slider label="Margin" value={20} onChange={() => {}} min={5} max={50} />);
    expect(screen.getByText('Margin')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('displays unit', () => {
    render(<Slider label="Margin" value={20} onChange={() => {}} min={5} max={50} unit="mm" />);
    expect(screen.getByText('20mm')).toBeInTheDocument();
  });

  it('renders a range input', () => {
    render(<Slider label="Test" value={10} onChange={() => {}} min={0} max={100} />);
    const input = screen.getByRole('slider');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '100');
  });
});
