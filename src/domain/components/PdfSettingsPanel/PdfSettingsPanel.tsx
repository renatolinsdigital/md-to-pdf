import { ColorPicker } from '@shared/components/ColorPicker/ColorPicker';
import { Slider } from '@shared/components/Slider/Slider';
import { Select } from '@shared/components/Select/Select';
import { Input } from '@shared/components/Input/Input';
import type { ConverterSettings } from '@domain/hooks/useConverterSettings';
import styles from './PdfSettingsPanel.module.scss';

interface PdfSettingsPanelProps {
  settings: ConverterSettings;
  onUpdateSettings: (updates: Partial<ConverterSettings>) => void;
  onUpdateMargins: (updates: Partial<ConverterSettings['margins']>) => void;
  onUpdatePageNumber: (updates: Partial<ConverterSettings['pageNumber']>) => void;
}

const PAGE_SIZE_OPTIONS = [
  { value: 'A4', label: 'A4 (210 × 297 mm)' },
  { value: 'LETTER', label: 'Letter (8.5 × 11 in)' },
  { value: 'LEGAL', label: 'Legal (8.5 × 14 in)' },
];

export function PdfSettingsPanel({
  settings,
  onUpdateSettings,
  onUpdateMargins,
  onUpdatePageNumber,
}: PdfSettingsPanelProps) {
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
        </div>
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
          <Slider
            label="Top"
            value={settings.margins.top}
            onChange={(v) => onUpdateMargins({ top: v })}
            min={5}
            max={50}
            unit="mm"
          />
          <Slider
            label="Right"
            value={settings.margins.right}
            onChange={(v) => onUpdateMargins({ right: v })}
            min={5}
            max={50}
            unit="mm"
          />
          <Slider
            label="Bottom"
            value={settings.margins.bottom}
            onChange={(v) => onUpdateMargins({ bottom: v })}
            min={5}
            max={50}
            unit="mm"
          />
          <Slider
            label="Left"
            value={settings.margins.left}
            onChange={(v) => onUpdateMargins({ left: v })}
            min={5}
            max={50}
            unit="mm"
          />
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
    </div>
  );
}
