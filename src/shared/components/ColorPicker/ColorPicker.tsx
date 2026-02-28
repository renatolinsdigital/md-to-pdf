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
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(color);
  }, [color]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClickOutside]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      onChange(value);
    }
  };

  return (
    <div className={styles.wrapper} ref={pickerRef}>
      {label && <span className={styles.label}>{label}</span>}
      <button
        className={styles.swatch}
        style={{ backgroundColor: color }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Pick color: ${color}`}
        type="button"
      />
      {isOpen && (
        <div className={styles.popover}>
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
