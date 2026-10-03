import { useId, type InputHTMLAttributes } from 'react';
import { classNames } from '@shared/helpers/classNames';
import styles from './Input.module.scss';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export function Input({ label, error, fullWidth = false, className, id, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={classNames(styles.wrapper, fullWidth && styles.fullWidth, className)}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={classNames(styles.input, error && styles.inputError)}
        {...props}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
