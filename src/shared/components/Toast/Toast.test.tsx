import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ToastProvider } from './ToastProvider';

describe('ToastProvider', () => {
  it('renders children', () => {
    render(
      <ToastProvider>
        <div>Test content</div>
      </ToastProvider>,
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
});
