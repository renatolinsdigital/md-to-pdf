import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PdfCanvasViewer } from './PdfCanvasViewer';

describe('PdfCanvasViewer', () => {
  it('shows a placeholder when there is no PDF yet', () => {
    render(<PdfCanvasViewer blob={null} isRendering={false} />);
    expect(screen.getByText(/start typing to see a live pdf preview/i)).toBeInTheDocument();
  });

  it('shows a generating message while rendering with no pages yet', () => {
    render(<PdfCanvasViewer blob={null} isRendering={true} />);
    expect(screen.getByText(/generating pdf/i)).toBeInTheDocument();
  });
});
