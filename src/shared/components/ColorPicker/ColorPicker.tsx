import { useRef } from 'react';
import { HexColorInput, HexColorPicker } from 'react-colorful';
import { usePopover } from '@shared/hooks/usePopover';
import styles from './ColorPicker.module.scss';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

export function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isOpen, toggle } = usePopover(containerRef);

  return (
    <div className={styles.wrapper} ref={containerRef}>
      {label && <span className={styles.label}>{label}</span>}
      <button
        className={styles.swatch}
        style={{ backgroundColor: color }}
        onClick={toggle}
        aria-label={`Pick color: ${color}`}
        type="button"
      />
      {isOpen && (
        <div className={styles.popover}>
          <HexColorPicker color={color} onChange={onChange} />
          <HexColorInput
            className={styles.hexInput}
            color={color}
            onChange={onChange}
            prefixed
            placeholder="#000000"
          />
        </div>
      )}
    </div>
  );
}
