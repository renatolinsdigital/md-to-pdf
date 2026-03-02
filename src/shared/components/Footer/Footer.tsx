import { useState } from 'react';
import { FiHeart } from 'react-icons/fi';
import { DonateModal } from './DonateModal';
import styles from './Footer.module.scss';

export function Footer() {
  const [showDonate, setShowDonate] = useState(false);
  const [donateKey, setDonateKey] = useState(0);

  const openDonate = () => {
    setDonateKey((k) => k + 1);
    setShowDonate(true);
  };

  return (
    <footer className={styles.footer}>
      <p className={styles.credit}>
        Developed with <FiHeart className={styles.heartIcon} /> by{' '}
        <span className={styles.author}>Renato Lins</span>
      </p>
      <button className={styles.donateButton} onClick={openDonate} type="button">
        Donate
      </button>

      <DonateModal key={donateKey} open={showDonate} onClose={() => setShowDonate(false)} />
    </footer>
  );
}
