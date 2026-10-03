import { useId, type TextareaHTMLAttributes } from 'react';
import { classNames } from '@shared/helpers/classNames';
import styles from './Textarea.module.scss';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export function Textarea({
  label,
  error,
  fullWidth = false,
  className,
  id,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <div className={classNames(styles.wrapper, fullWidth && styles.fullWidth, className)}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={classNames(styles.textarea, error && styles.textareaError)}
        {...props}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
