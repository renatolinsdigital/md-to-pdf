import { useRef, useState, type ChangeEvent } from 'react';
import { Button } from '@shared/components/Button/Button';
import { ColorPicker } from '@shared/components/ColorPicker/ColorPicker';
import { Slider } from '@shared/components/Slider/Slider';
import { Select } from '@shared/components/Select/Select';
import { Input } from '@shared/components/Input/Input';
import { classNames } from '@shared/helpers/classNames';
import type { ConverterSettings } from '@domain/hooks/useConverterSettings';
import {
  PATTERNS,
  buildPatternPreviewSvg,
  hexToRgba,
  svgDataUrl,
} from '@domain/helpers/backgroundPatterns';
import {
  CUSTOM_PATTERN_ID,
  InvalidSvgError,
  readCustomSvgFile,
} from '@domain/helpers/customPattern';
import styles from './PdfSettingsPanel.module.scss';

interface PdfSettingsPanelProps {
  settings: ConverterSettings;
  onUpdateSettings: (updates: Partial<ConverterSettings>) => void;
  onUpdateMargins: (updates: Partial<ConverterSettings['margins']>) => void;
  onUpdatePageNumber: (updates: Partial<ConverterSettings['pageNumber']>) => void;
  onUpdateBackgroundPattern: (updates: Partial<ConverterSettings['backgroundPattern']>) => void;
  onReset: () => void;
}

const PAGE_SIZE_OPTIONS = [
  { value: 'A4', label: 'A4 (210 × 297 mm)' },
  { value: 'LETTER', label: 'Letter (8.5 × 11 in)' },
  { value: 'LEGAL', label: 'Legal (8.5 × 14 in)' },
];

const MARGIN_SIDES = [
  { side: 'top', label: 'Top' },
  { side: 'right', label: 'Right' },
  { side: 'bottom', label: 'Bottom' },
  { side: 'left', label: 'Left' },
] as const;

/** Swatches are drawn at least this opaque so faint patterns stay recognisable. */
const MIN_SWATCH_OPACITY = 0.4;

export function PdfSettingsPanel({
  settings,
  onUpdateSettings,
  onUpdateMargins,
  onUpdatePageNumber,
  onUpdateBackgroundPattern,
  onReset,
}: PdfSettingsPanelProps) {
  const {
    patternId: activePatternId,
    opacity: patternOpacity,
    patternColor,
    customSvg,
  } = settings.backgroundPattern;
  const swatchOpacity = Math.max(patternOpacity, MIN_SWATCH_OPACITY);
  const swatchClass = (patternId: string) =>
    classNames(styles.patternSwatch, activePatternId === patternId && styles.patternSwatchActive);

  const iconInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploadLabel = customSvg ? 'Replace custom SVG icon' : 'Upload SVG icon';

  const handleIconUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // so choosing the same file again still fires a change
    if (!file) return;

    try {
      const svg = await readCustomSvgFile(file);
      setUploadError(null);
      onUpdateBackgroundPattern({ customSvg: svg, patternId: CUSTOM_PATTERN_ID });
    } catch (error) {
      if (error instanceof InvalidSvgError) {
        setUploadError(error.message);
      } else {
        console.error('Failed to read the uploaded SVG', error);
        setUploadError('The file could not be read.');
      }
    }
  };

  const removeCustomIcon = () => {
    onUpdateBackgroundPattern({
      customSvg: null,
      ...(activePatternId === CUSTOM_PATTERN_ID && { patternId: 'none' }),
    });
  };

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>PDF Settings</h3>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Colors</h4>
        <div className={styles.colorRow}>
          <ColorPicker
            label="Background"
            color={settings.backgroundColor}
            onChange={(color) => onUpdateSettings({ backgroundColor: color })}
          />
          <ColorPicker
            label="Text"
            color={settings.textColor}
            onChange={(color) => onUpdateSettings({ textColor: color })}
          />
          {activePatternId !== 'none' && (
            <ColorPicker
              label="Pattern"
              color={settings.backgroundPattern.patternColor}
              onChange={(color) => onUpdateBackgroundPattern({ patternColor: color })}
            />
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Background Pattern</h4>
        <div className={styles.patternGrid} style={{ backgroundColor: settings.backgroundColor }}>
          <button
            type="button"
            className={swatchClass('none')}
            onClick={() => onUpdateBackgroundPattern({ patternId: 'none' })}
            title="No pattern"
          >
            <svg
              className={styles.patternNone}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" stroke="#dc2626" strokeWidth="2.5" fill="none" />
              <line x1="5" y1="5" x2="19" y2="19" stroke="#dc2626" strokeWidth="2.5" />
            </svg>
          </button>
          {PATTERNS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={swatchClass(p.id)}
              onClick={() => onUpdateBackgroundPattern({ patternId: p.id })}
              title={p.label}
            >
              <img
                src={buildPatternPreviewSvg(p, patternColor, swatchOpacity)}
                alt={p.label}
                width={20}
                height={20}
                draggable={false}
              />
            </button>
          ))}
          {customSvg && (
            <button
              type="button"
              className={swatchClass(CUSTOM_PATTERN_ID)}
              onClick={() => onUpdateBackgroundPattern({ patternId: CUSTOM_PATTERN_ID })}
              title="Custom icon"
              aria-label="Custom icon"
            >
              {/* Masked rather than shown as-is, so it takes the pattern colour like the PDF does */}
              <span
                className={styles.customIcon}
                style={{
                  maskImage: `url("${svgDataUrl(customSvg)}")`,
                  backgroundColor: hexToRgba(patternColor, swatchOpacity),
                }}
              />
            </button>
          )}
          <button
            type="button"
            className={classNames(styles.patternSwatch, styles.uploadSwatch)}
            onClick={() => iconInputRef.current?.click()}
            title={uploadLabel}
            aria-label={uploadLabel}
          >
            +
          </button>
          <input
            ref={iconInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            className={styles.hiddenInput}
            onChange={handleIconUpload}
            data-testid="pattern-icon-input"
          />
        </div>
        {uploadError && (
          <p className={styles.uploadError} role="alert">
            {uploadError}
          </p>
        )}
        {customSvg && (
          <Button variant="ghost" size="sm" onClick={removeCustomIcon}>
            Remove custom icon
          </Button>
        )}
        {activePatternId !== 'none' && (
          <>
            <Slider
              label="Pattern opacity"
              value={Math.round(patternOpacity * 100)}
              onChange={(v) => onUpdateBackgroundPattern({ opacity: v / 100 })}
              min={1}
              max={30}
              unit="%"
            />
            <Slider
              label="Element size"
              value={settings.backgroundPattern.elementSize}
              onChange={(v) => onUpdateBackgroundPattern({ elementSize: v })}
              min={12}
              max={60}
              unit="pt"
            />
            <Slider
              label="Gap"
              value={settings.backgroundPattern.gap}
              onChange={(v) => onUpdateBackgroundPattern({ gap: v })}
              min={8}
              max={80}
              unit="pt"
            />
          </>
        )}
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Page Size</h4>
        <Select
          options={PAGE_SIZE_OPTIONS}
          value={settings.pageSize}
          onChange={(value) =>
            onUpdateSettings({
              pageSize: value as ConverterSettings['pageSize'],
            })
          }
        />
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Margins</h4>
        <div className={styles.margins}>
          {MARGIN_SIDES.map(({ side, label }) => (
            <Slider
              key={side}
              label={label}
              value={settings.margins[side]}
              onChange={(v) => onUpdateMargins({ [side]: v })}
              min={5}
              max={50}
              unit="mm"
            />
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Page Numbering</h4>

        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={settings.pageNumber.enabled}
            onChange={(e) => onUpdatePageNumber({ enabled: e.target.checked })}
          />
          <span>Show page numbers</span>
        </label>

        {settings.pageNumber.enabled && (
          <div className={styles.pageNumberConfig}>
            <Input
              label='"Page" label'
              value={settings.pageNumber.pageLabel}
              onChange={(e) => onUpdatePageNumber({ pageLabel: e.target.value })}
              placeholder="Page"
            />
            <Input
              label='"of" label'
              value={settings.pageNumber.ofLabel}
              onChange={(e) => onUpdatePageNumber({ ofLabel: e.target.value })}
              placeholder="of"
            />
            <Slider
              label="Font size"
              value={settings.pageNumber.fontSize}
              onChange={(v) => onUpdatePageNumber({ fontSize: v })}
              min={6}
              max={16}
              unit="pt"
            />
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Editor</h4>
        <Slider
          label="Undo history size"
          value={settings.historySize}
          onChange={(v) => onUpdateSettings({ historySize: v })}
          min={10}
          max={200}
          unit=" steps"
        />
      </div>

      <div className={styles.section}>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
