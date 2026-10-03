import { useRef, useState } from 'react';
import { FiCheck, FiDroplet } from 'react-icons/fi';
import { HexColorInput, HexColorPicker } from 'react-colorful';
import { usePopover } from '@shared/hooks/usePopover';
import styles from './FormattingToolbar.module.scss';

const DEFAULT_COLOR = '#ef4444';

const PRESET_COLORS = [
  DEFAULT_COLOR,
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#1f2937',
  '#6b7280',
  '#ffffff',
  '#000000',
];

interface TextColorPopoverProps {
  onApply: (color: string) => void;
}

export function TextColorPopover({ onApply }: TextColorPopoverProps) {
  const [color, setColor] = useState(DEFAULT_COLOR);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isOpen, toggle, close } = usePopover(containerRef);

  const handleApply = () => {
    onApply(color);
    close();
  };

  return (
    <div className={styles.colorWrapper} ref={containerRef}>
      <button
        className={styles.button}
        onClick={toggle}
        title="Apply color to selected text"
        type="button"
      >
        <FiDroplet />
        <span className={styles.colorIndicator} style={{ backgroundColor: color }} />
      </button>

      {isOpen && (
        <div className={styles.colorPopover}>
          <div className={styles.pickerHeader}>
            <span>Text Color</span>
            <div className={styles.pickerPreview} style={{ backgroundColor: color }} />
          </div>
          <HexColorPicker color={color} onChange={setColor} />
          <div className={styles.presets}>
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset}
                type="button"
                className={styles.presetSwatch}
                style={{ backgroundColor: preset }}
                onClick={() => setColor(preset)}
                title={preset}
                aria-label={preset}
              >
                {preset === color && <FiCheck className={styles.presetCheck} />}
              </button>
            ))}
          </div>
          <div className={styles.hexRow}>
            <span className={styles.hexHash}>#</span>
            <HexColorInput className={styles.hexInput} color={color} onChange={setColor} />
            <button
              className={styles.applyColor}
              onClick={handleApply}
              type="button"
              title="Apply color to selection"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
