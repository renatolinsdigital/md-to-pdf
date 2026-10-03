import { useEffect, useState } from 'react';
import { FiCheck, FiCopy } from 'react-icons/fi';
import { classNames } from '@shared/helpers/classNames';
import styles from './DonationEmail.module.scss';

type CopyStatus = 'idle' | 'copied' | 'failed';

const COPY_FEEDBACK_MS = 2000;

const COPY_LABELS: Record<CopyStatus, string> = {
  idle: 'Copy',
  copied: 'Copied',
  failed: 'Copy failed',
};

interface DonationEmailProps {
  email: string;
  className?: string;
}

/** Lets donors send money from their own PayPal app instead of the donate link. */
export function DonationEmail({ email, className }: DonationEmailProps) {
  const [status, setStatus] = useState<CopyStatus>('idle');

  useEffect(() => {
    if (status === 'idle') return;
    const timer = setTimeout(() => setStatus('idle'), COPY_FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [status]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setStatus('copied');
    } catch (error) {
      // Clipboard access can be denied (e.g. insecure context); the email stays selectable as a fallback
      console.error('Failed to copy donation email', error);
      setStatus('failed');
    }
  };

  return (
    <div className={classNames(styles.root, className)}>
      <span className={styles.label}>Or send via PayPal to</span>
      <div className={styles.box}>
        <span className={styles.email}>{email}</span>
        <button
          className={classNames(
            styles.copyBtn,
            status === 'copied' && styles.copyBtnSuccess,
            status === 'failed' && styles.copyBtnError,
          )}
          onClick={handleCopy}
          type="button"
          aria-live="polite"
        >
          {status === 'copied' ? <FiCheck /> : <FiCopy />}
          {COPY_LABELS[status]}
        </button>
      </div>
    </div>
  );
}
