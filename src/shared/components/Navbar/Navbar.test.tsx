import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { Navbar } from './Navbar';

function renderNavbar() {
  return render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>,
  );
}

describe('Navbar', () => {
  it('renders the logo', () => {
    renderNavbar();
    expect(screen.getByText('MD to PDF')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderNavbar();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Converter')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('has correct link destinations', () => {
    renderNavbar();
    expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('Converter').closest('a')).toHaveAttribute('href', '/converter');
    expect(screen.getByText('About').closest('a')).toHaveAttribute('href', '/about');
  });
});
