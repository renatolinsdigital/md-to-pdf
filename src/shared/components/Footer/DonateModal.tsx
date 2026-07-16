import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { FiX, FiHeart, FiShield } from 'react-icons/fi';
import { DonationCat } from './DonationCat';
import styles from './DonateModal.module.scss';

interface DonateModalProps {
  open: boolean;
  onClose: () => void;
}

const PRESET_AMOUNTS = [3, 5, 10, 25];

interface AmountButtonProps {
  amount: number;
  active: boolean;
  onClick: () => void;
}

function AmountButton({ amount, active, onClick }: AmountButtonProps) {
  return (
    <button
      className={`${styles.amountBtn} ${active ? styles.amountBtnActive : ''}`}
      onClick={onClick}
      type="button"
    >
      <span className={styles.amountCurrency}>$</span>
      <span className={styles.amountValue}>{amount}</span>
    </button>
  );
}

export function DonateModal({ open, onClose }: DonateModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(5);
  const [customValue, setCustomValue] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [smileTrigger, setSmileTrigger] = useState(0);

  // Sync dialog element with open prop & reset form on open
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Close on backdrop click
  const handleBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomValue('');
    setSmileTrigger((n) => n + 1);
  };

  const handleCustomFocus = () => {
    setIsCustom(true);
    setSelectedAmount(null);
  };

  const handleDonate = () => {
    const amount = isCustom ? parseFloat(customValue) || 0 : selectedAmount || 0;
    window.open(
      `https://www.paypal.com/donate/?amount=${amount}&hosted_button_id=MOCK_BUTTON_ID`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const donateEnabled = isCustom ? parseFloat(customValue) > 0 : selectedAmount !== null;

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClick={handleBackdropClick}
      onClose={onClose}
    >
      <div className={styles.modal}>
        {/* Close */}
        <button className={styles.closeBtn} onClick={onClose} type="button" aria-label="Close">
          <FiX />
        </button>

        {/* Header area with cat */}
        <div className={styles.header}>
          <div className={styles.catWrapper}>
            <DonationCat className={styles.cat} smileTrigger={smileTrigger} />
          </div>
        </div>

        {/* Text */}
        <h2 className={styles.title}>
          Buy my cat a treat <span className={styles.emoji}>🐾</span>
        </h2>
        <p className={styles.description}>
          Your support keeps this tool free and ad-free. Every contribution makes our cat purr with
          joy.
        </p>

        {/* Preset amounts */}
        <div className={styles.amountGrid}>
          {PRESET_AMOUNTS.map((amount) => (
            <AmountButton
              key={amount}
              amount={amount}
              active={!isCustom && selectedAmount === amount}
              onClick={() => handlePresetClick(amount)}
            />
          ))}
        </div>

        {/* Custom amount input */}
        <div className={`${styles.customInputWrapper} ${isCustom ? styles.customInputActive : ''}`}>
          <span className={styles.customPrefix}>$</span>
          <input
            className={styles.customInput}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            placeholder="Other amount"
            value={customValue}
            onFocus={handleCustomFocus}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 4);
              setCustomValue(val);
              if (val) setSmileTrigger((n) => n + 1);
            }}
          />
        </div>

        {/* Donate CTA */}
        <button
          className={styles.donateBtn}
          onClick={handleDonate}
          disabled={!donateEnabled}
          type="button"
        >
          <FiHeart className={styles.donateBtnIcon} />
          Donate{donateEnabled && !isCustom && selectedAmount ? ` $${selectedAmount}` : ''}
          {donateEnabled && isCustom && parseFloat(customValue) > 0 ? ` $${customValue}` : ''}
        </button>

        {/* Trust badges */}
        <div className={styles.trustRow}>
          <FiShield className={styles.trustIcon} />
          <span>Secure payment via PayPal</span>
        </div>
      </div>
    </dialog>
  );
}
