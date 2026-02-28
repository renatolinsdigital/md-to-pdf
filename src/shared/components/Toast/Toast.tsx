import { FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import type { ToastItem } from './ToastProvider';
import styles from './Toast.module.scss';

const icons = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  warning: FiAlertTriangle,
  info: FiInfo,
};

interface ToastProps {
  toast: ToastItem;
}

export function Toast({ toast }: ToastProps) {
  const Icon = icons[toast.variant];

  return (
    <div className={`${styles.toast} ${styles[toast.variant]}`} role="alert">
      <div className={styles.content}>
        <Icon className={styles.icon} />
        <span className={styles.message}>{toast.message}</span>
      </div>
      <div className={styles.progressBar}>
        <div className={styles.progress} />
      </div>
    </div>
  );
}
