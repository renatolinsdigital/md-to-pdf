import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { Footer } from './Footer';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

describe('Footer', () => {
  it('renders the credit line and donate button', () => {
    render(<Footer />);
    expect(screen.getByText(/developed with/i)).toBeInTheDocument();
    expect(screen.getByText('Renato Lins')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /donate/i })).toBeInTheDocument();
  });

  it('opens the donate modal when the donate button is clicked', async () => {
    const user = userEvent.setup();
    render(<Footer />);

    await user.click(screen.getByRole('button', { name: /donate/i }));

    expect(screen.getByText(/buy our cat a treat/i)).toBeInTheDocument();
  });
});
