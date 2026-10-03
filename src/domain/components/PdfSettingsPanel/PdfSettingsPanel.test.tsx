import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PdfSettingsPanel } from './PdfSettingsPanel';
import { DEFAULT_SETTINGS, type ConverterSettings } from '@domain/hooks/useConverterSettings';

function renderPanel(settings: ConverterSettings = DEFAULT_SETTINGS) {
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

  it('selects an uploaded SVG as the custom pattern', async () => {
    const user = userEvent.setup();
    const { onUpdateBackgroundPattern } = renderPanel();
    const file = new File(
      ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle r="4"/></svg>'],
      'icon.svg',
      { type: 'image/svg+xml' },
    );

    await user.upload(screen.getByTestId('pattern-icon-input'), file);

    expect(onUpdateBackgroundPattern).toHaveBeenCalledWith({
      customSvg: expect.stringContaining('<circle'),
      patternId: 'custom',
    });
  });

  it('shows an error when the uploaded file is not a valid SVG', async () => {
    const user = userEvent.setup();
    const { onUpdateBackgroundPattern } = renderPanel();
    const file = new File(['<html></html>'], 'icon.svg', { type: 'image/svg+xml' });

    await user.upload(screen.getByTestId('pattern-icon-input'), file);

    expect(await screen.findByRole('alert')).toHaveTextContent('not a valid SVG');
    expect(onUpdateBackgroundPattern).not.toHaveBeenCalled();
  });

  it('removes the custom icon and clears it as the active pattern', async () => {
    const user = userEvent.setup();
    const { onUpdateBackgroundPattern } = renderPanel({
      ...DEFAULT_SETTINGS,
      backgroundPattern: {
        ...DEFAULT_SETTINGS.backgroundPattern,
        patternId: 'custom',
        customSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"/>',
      },
    });

    expect(screen.getByRole('button', { name: 'Custom icon' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /remove custom icon/i }));

    expect(onUpdateBackgroundPattern).toHaveBeenCalledWith({ customSvg: null, patternId: 'none' });
  });

  it('shows pattern controls when a pattern is active', () => {
    renderPanel({
      ...DEFAULT_SETTINGS,
      backgroundPattern: { ...DEFAULT_SETTINGS.backgroundPattern, patternId: 'dots' },
    });
    expect(screen.getByText('Pattern opacity')).toBeInTheDocument();
  });
});
