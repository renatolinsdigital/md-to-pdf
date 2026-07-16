import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PdfSettingsPanel } from './PdfSettingsPanel';
import type { ConverterSettings } from '@domain/hooks/useConverterSettings';

const baseSettings: ConverterSettings = {
  backgroundColor: '#FFFFFF',
  backgroundPattern: {
    patternId: 'none',
    opacity: 0.04,
    elementSize: 22,
    gap: 20,
    patternColor: '#000000',
  },
  margins: { top: 20, right: 20, bottom: 20, left: 20 },
  pageSize: 'A4',
  pageNumber: {
    enabled: true,
    pageLabel: 'Page',
    ofLabel: 'of',
    fontSize: 10,
  },
  textColor: '#000000',
  historySize: 50,
};

function renderPanel(settings: ConverterSettings = baseSettings) {
  const onUpdateSettings = vi.fn();
  const onUpdateMargins = vi.fn();
  const onUpdatePageNumber = vi.fn();
  const onUpdateBackgroundPattern = vi.fn();
  const onReset = vi.fn();

  render(
    <PdfSettingsPanel
      settings={settings}
      onUpdateSettings={onUpdateSettings}
      onUpdateMargins={onUpdateMargins}
      onUpdatePageNumber={onUpdatePageNumber}
      onUpdateBackgroundPattern={onUpdateBackgroundPattern}
      onReset={onReset}
    />,
  );

  return {
    onUpdateSettings,
    onUpdateMargins,
    onUpdatePageNumber,
    onUpdateBackgroundPattern,
    onReset,
  };
}

describe('PdfSettingsPanel', () => {
  it('renders the settings sections', () => {
    renderPanel();
    expect(screen.getByText('PDF Settings')).toBeInTheDocument();
    expect(screen.getByText('Colors')).toBeInTheDocument();
    expect(screen.getByText('Background Pattern')).toBeInTheDocument();
    expect(screen.getByText('Page Size')).toBeInTheDocument();
    expect(screen.getByText('Margins')).toBeInTheDocument();
    expect(screen.getByText('Page Numbering')).toBeInTheDocument();
  });

  it('calls onReset when "Reset to Defaults" is clicked', async () => {
    const user = userEvent.setup();
    const { onReset } = renderPanel();

    await user.click(screen.getByRole('button', { name: /reset to defaults/i }));

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('hides pattern controls when the pattern is set to none', () => {
    renderPanel();
    expect(screen.queryByText('Pattern opacity')).not.toBeInTheDocument();
  });

  it('shows pattern controls when a pattern is active', () => {
    renderPanel({
      ...baseSettings,
      backgroundPattern: { ...baseSettings.backgroundPattern, patternId: 'dots' },
    });
    expect(screen.getByText('Pattern opacity')).toBeInTheDocument();
  });
});
