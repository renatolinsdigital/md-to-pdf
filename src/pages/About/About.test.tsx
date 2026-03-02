import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { ToastProvider } from '@shared/components/Toast/ToastProvider';
import { About } from './About';

function renderAbout() {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <About />
      </ToastProvider>
    </BrowserRouter>,
  );
}

describe('About', () => {
  it('renders the page title', () => {
    renderAbout();
    expect(screen.getByText('About MD to PDF')).toBeInTheDocument();
  });

  it('renders the contact form', () => {
    renderAbout();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
  });

  it('renders the send button', () => {
    renderAbout();
    expect(screen.getByText('Send Message')).toBeInTheDocument();
  });

  it('renders the free and private banner', () => {
    renderAbout();
    expect(screen.getByText('100% Free')).toBeInTheDocument();
    expect(screen.getByText('Fully Private')).toBeInTheDocument();
  });
});
