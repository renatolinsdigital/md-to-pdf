import { useEffect, useState } from 'react';
import { classNames } from '@shared/helpers/classNames';
import styles from './DonationCat.module.scss';

type CatState = 'idle' | 'blinking' | 'smiling';

const BLINK_MS = 160;
const SMILE_MS = 2000;

interface DonationCatProps {
  className?: string;
  /** Change this number to make the cat smile for a moment. */
  smileTrigger?: number;
}

/**
 * Cat face based on Icon Park "cat" icon (Apache 2.0).
 * Clean outline style. Eyes become happy arcs (^_^) for 2 s when smileTrigger changes.
 */
export function DonationCat({ className, smileTrigger = 0 }: DonationCatProps) {
  const [state, setState] = useState<CatState>('idle');

  // Blink at random intervals (a smile takes precedence)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const scheduleBlink = () => {
      timer = setTimeout(
        () => {
          setState((s) => (s === 'smiling' ? s : 'blinking'));
          timer = setTimeout(() => {
            setState((s) => (s === 'blinking' ? 'idle' : s));
            scheduleBlink();
          }, BLINK_MS);
        },
        2400 + Math.random() * 2600,
      );
    };
    scheduleBlink();
    return () => clearTimeout(timer);
  }, []);

  // Smile, then blink back to idle. The initial value 0 means "not triggered yet".
  useEffect(() => {
    if (smileTrigger === 0) return;
    const timers = [
      setTimeout(() => setState('smiling'), 0),
      setTimeout(() => setState('blinking'), SMILE_MS),
      setTimeout(() => setState('idle'), SMILE_MS + BLINK_MS),
    ];
    return () => timers.forEach(clearTimeout);
  }, [smileTrigger]);

  return (
    <svg
      className={classNames(styles.cat, className)}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Kawaii cat"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Head, ears and forehead */}
      <g strokeWidth="4">
        <path d="M8 34c0 13.255 10.745 24 24 24s24-10.745 24-24" />
        <path d="M8 34V10c0-2.2 2.6-3.3 4.1-1.7L22 18" />
        <path d="M56 34V10c0-2.2-2.6-3.3-4.1-1.7L42 18" />
        <path d="M22 18c3-2.2 6.5-3.2 10-3.2s7 1 10 3.2" />
      </g>

      {/* Eyes */}
      {state === 'smiling' ? (
        <g strokeWidth="3">
          <path d="M19 33 Q24 26 29 33" />
          <path d="M35 33 Q40 26 45 33" />
        </g>
      ) : state === 'blinking' ? (
        <g strokeWidth="3">
          <line x1="20" y1="32" x2="28" y2="32" />
          <line x1="36" y1="32" x2="44" y2="32" />
        </g>
      ) : (
        <g fill="currentColor" stroke="none">
          <circle cx="24" cy="32" r="3.5" />
          <circle cx="40" cy="32" r="3.5" />
        </g>
      )}

      {/* Nose (inverted triangle) */}
      <path d="M30 41 L32 44 L34 41 Z" fill="currentColor" stroke="none" />

      {/* Mouth (ω shape) */}
      <path d="M27 46 Q30 50 32 46 Q34 50 37 46" strokeWidth="2" />

      {/* Whiskers */}
      <g strokeWidth="2" opacity="0.35">
        <line x1="18" y1="42" x2="3" y2="40" />
        <line x1="17" y1="47" x2="2" y2="49" />
        <line x1="46" y1="42" x2="61" y2="40" />
        <line x1="47" y1="47" x2="62" y2="49" />
      </g>
    </svg>
  );
}
