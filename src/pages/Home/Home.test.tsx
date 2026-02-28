import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { Home } from './Home';

describe('Home', () => {
  it('renders the hero title', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    );
    expect(screen.getByText(/Markdown/)).toBeInTheDocument();
    expect(screen.getByText(/beautiful PDFs/)).toBeInTheDocument();
  });

  it('renders the CTA button', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    );
    expect(screen.getByText('Start Converting')).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    );
    expect(screen.getByText('Live Preview')).toBeInTheDocument();
    expect(screen.getByText('Rich Formatting')).toBeInTheDocument();
    expect(screen.getByText('Custom Styling')).toBeInTheDocument();
    expect(screen.getByText('Vector PDF')).toBeInTheDocument();
  });
});
