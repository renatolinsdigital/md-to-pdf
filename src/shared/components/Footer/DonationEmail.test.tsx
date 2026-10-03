import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { DonationEmail } from './DonationEmail';

const EMAIL = 'donor-target@example.com';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('DonationEmail', () => {
  it('renders the email address', () => {
    render(<DonationEmail email={EMAIL} />);
    expect(screen.getByText(EMAIL)).toBeInTheDocument();
  });

  it('copies the email to the clipboard', async () => {
    // userEvent.setup() installs its own clipboard stub, so spy after it
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText');
    render(<DonationEmail email={EMAIL} />);

    await user.click(screen.getByRole('button', { name: /copy/i }));

    expect(writeText).toHaveBeenCalledWith(EMAIL);
    expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument();
  });

  it('reports a failed copy', async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<DonationEmail email={EMAIL} />);

    await user.click(screen.getByRole('button', { name: /copy/i }));

    expect(screen.getByRole('button', { name: /copy failed/i })).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalled();
  });
});
