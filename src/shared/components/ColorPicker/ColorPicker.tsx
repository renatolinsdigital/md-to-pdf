import { useState, useRef, useEffect, useCallback } from 'react';
import { HexColorPicker } from 'react-colorful';
import styles from './ColorPicker.module.scss';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

export function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(color);
  const popoverRef = useRef<HTMLDivElement>(null);
  const swatchRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setInputValue(color);
  }, [color]);

  const handleClickOutside = useCallback((e: PointerEvent) => {
    const target = e.target as Node;
    const insidePopover = popoverRef.current?.contains(target);
    const insideSwatch = swatchRef.current?.contains(target);
    if (!insidePopover && !insideSwatch) {
      setIsOpen(false);
    }
  }, []);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClickOutside, handleEscape]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      onChange(value);
    }
  };

  return (
    <div className={styles.wrapper}>
      {label && <span className={styles.label}>{label}</span>}
      <button
        ref={swatchRef}
        className={styles.swatch}
        style={{ backgroundColor: color }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Pick color: ${color}`}
        type="button"
      />
      {isOpen && (
        <div className={styles.popover} ref={popoverRef}>
          <HexColorPicker color={color} onChange={onChange} />
          <input
            className={styles.hexInput}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="#000000"
            maxLength={7}
          />
        </div>
      )}
    </div>
  );
}
