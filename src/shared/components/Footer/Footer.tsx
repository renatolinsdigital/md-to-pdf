import { useState } from 'react';
import { FiHeart } from 'react-icons/fi';
import { DonateModal } from './DonateModal';
import styles from './Footer.module.scss';

export function Footer() {
  const [showDonate, setShowDonate] = useState(false);

  return (
    <footer className={styles.footer}>
      <p className={styles.credit}>
        Developed with <FiHeart className={styles.heartIcon} /> by{' '}
        <span className={styles.author}>Renato Lins</span>
      </p>
      <button className={styles.donateButton} onClick={() => setShowDonate(true)} type="button">
        Donate
      </button>

      {/* Mounted only while open, so the form starts fresh every time */}
      {showDonate && <DonateModal onClose={() => setShowDonate(false)} />}
    </footer>
  );
}
