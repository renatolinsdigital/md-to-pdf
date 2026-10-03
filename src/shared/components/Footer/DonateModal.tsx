import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { FiX, FiHeart, FiShield } from 'react-icons/fi';
import { classNames } from '@shared/helpers/classNames';
import { DonationCat } from './DonationCat';
import { DonationEmail } from './DonationEmail';
import styles from './DonateModal.module.scss';

interface DonateModalProps {
  onClose: () => void;
}

const PRESET_AMOUNTS = [3, 5, 10, 25];

const PAYPAL_DONATION_EMAIL = 'renato.digital.crafts@gmail.com';

// The UI shows amounts in dollars, so the currency is pinned to match
function buildDonationUrl(amount: number): string {
  const params = new URLSearchParams({
    business: PAYPAL_DONATION_EMAIL,
    amount: String(amount),
    currency_code: 'USD',
    item_name: 'MD to PDF donation',
  });
  return `https://www.paypal.com/donate/?${params}`;
}

interface AmountButtonProps {
  amount: number;
  active: boolean;
  onClick: () => void;
}

function AmountButton({ amount, active, onClick }: AmountButtonProps) {
  return (
    <button
      className={classNames(styles.amountBtn, active && styles.amountBtnActive)}
      onClick={onClick}
      type="button"
    >
      <span className={styles.amountCurrency}>$</span>
      <span className={styles.amountValue}>{amount}</span>
    </button>
  );
}

export function DonateModal({ onClose }: DonateModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(5);
  const [customValue, setCustomValue] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [smileTrigger, setSmileTrigger] = useState(0);

  // showModal() (rather than the `open` attribute) gives focus trapping and Escape-to-close
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const amount = isCustom ? Number(customValue) : (selectedAmount ?? 0);
  const canDonate = amount > 0;

  const handleBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  const handlePresetClick = (preset: number) => {
    setSelectedAmount(preset);
    setIsCustom(false);
    setCustomValue('');
    setSmileTrigger((n) => n + 1);
  };

  const handleCustomFocus = () => {
    setIsCustom(true);
    setSelectedAmount(null);
  };

  const handleCustomChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setCustomValue(digits);
    if (digits) setSmileTrigger((n) => n + 1);
  };

  const handleDonate = () => {
    window.open(buildDonationUrl(amount), '_blank', 'noopener,noreferrer');
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClick={handleBackdropClick}
      onClose={onClose}
    >
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} type="button" aria-label="Close">
          <FiX />
        </button>

        <div className={styles.header}>
          <div className={styles.catWrapper}>
            <DonationCat className={styles.cat} smileTrigger={smileTrigger} />
          </div>
        </div>

        <h2 className={styles.title}>
          Buy my cat a treat <span className={styles.emoji}>🐾</span>
        </h2>
        <p className={styles.description}>
          Your support keeps this tool free and ad-free. Every contribution makes our cat purr with
          joy.
        </p>

        <div className={styles.amountGrid}>
          {PRESET_AMOUNTS.map((preset) => (
            <AmountButton
              key={preset}
              amount={preset}
              active={!isCustom && selectedAmount === preset}
              onClick={() => handlePresetClick(preset)}
            />
          ))}
        </div>

        <div
          className={classNames(styles.customInputWrapper, isCustom && styles.customInputActive)}
        >
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
            onChange={(e) => handleCustomChange(e.target.value)}
          />
        </div>

        <button
          className={styles.donateBtn}
          onClick={handleDonate}
          disabled={!canDonate}
          type="button"
        >
          <FiHeart className={styles.donateBtnIcon} />
          Donate{canDonate && ` $${amount}`}
        </button>

        <DonationEmail email={PAYPAL_DONATION_EMAIL} className={styles.emailRow} />

        <div className={styles.trustRow}>
          <FiShield className={styles.trustIcon} />
          <span>Secure payment via PayPal</span>
        </div>
      </div>
    </dialog>
  );
}
