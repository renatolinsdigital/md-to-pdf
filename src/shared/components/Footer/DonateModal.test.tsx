import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { DonateModal } from './DonateModal';

// jsdom lacks showModal; the dialog must actually be open or its contents are inaccessible to role queries
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function getOpenedUrl(openSpy: ReturnType<typeof vi.spyOn>): URL {
  expect(openSpy).toHaveBeenCalledTimes(1);
  return new URL(openSpy.mock.calls[0][0] as string);
}

describe('DonateModal', () => {
  it('sends the default amount to the PayPal donation email', async () => {
    const user = userEvent.setup();
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    render(<DonateModal onClose={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /donate \$5/i }));

    const url = getOpenedUrl(openSpy);
    expect(url.origin + url.pathname).toBe('https://www.paypal.com/donate/');
    expect(url.searchParams.get('business')).toBe('renato.digital.crafts@gmail.com');
    expect(url.searchParams.get('amount')).toBe('5');
    expect(url.searchParams.get('currency_code')).toBe('USD');
    expect(url.searchParams.has('hosted_button_id')).toBe(false);
  });

  it('sends a custom amount', async () => {
    const user = userEvent.setup();
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    render(<DonateModal onClose={vi.fn()} />);

    await user.type(screen.getByPlaceholderText(/other amount/i), '42');
    await user.click(screen.getByRole('button', { name: /donate \$42/i }));

    const url = getOpenedUrl(openSpy);
    expect(url.searchParams.get('business')).toBe('renato.digital.crafts@gmail.com');
    expect(url.searchParams.get('amount')).toBe('42');
  });

  it('shows the PayPal email for direct transfers', () => {
    render(<DonateModal onClose={vi.fn()} />);
    expect(screen.getByText('renato.digital.crafts@gmail.com')).toBeInTheDocument();
  });

  it('disables the donate button when the custom amount is empty', async () => {
    const user = userEvent.setup();
    render(<DonateModal onClose={vi.fn()} />);

    await user.click(screen.getByPlaceholderText(/other amount/i));

    expect(screen.getByRole('button', { name: /^donate$/i })).toBeDisabled();
  });
});
