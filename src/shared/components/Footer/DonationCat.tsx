import { useEffect, useState, useCallback, useRef } from 'react';
import styles from './DonationCat.module.scss';

type CatState = 'idle' | 'blinking' | 'smiling';

interface DonationCatProps {
  className?: string;
  smileTrigger?: number;
}

/**
 * Cat face based on Icon Park "cat" icon (Apache 2.0).
 * Clean outline style. Eyes become happy arcs (^_^) for 2 s when smileTrigger changes.
 */
export function DonationCat({ className, smileTrigger = 0 }: DonationCatProps) {
  const [state, setState] = useState<CatState>('idle');
  const smileTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const mounted = useRef(false);

  const blink = useCallback(() => {
    setState((s) => (s === 'smiling' ? s : 'blinking'));
    setTimeout(() => setState((s) => (s === 'blinking' ? 'idle' : s)), 160);
  }, []);

  // Random blink loop
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(
        () => {
          blink();
          loop();
        },
        2400 + Math.random() * 2600,
      );
    };
    loop();
    return () => clearTimeout(t);
  }, [blink]);

  // Smile when trigger changes (skip initial mount)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    clearTimeout(smileTimer.current);
    const id = setTimeout(() => setState('smiling'), 0);
    smileTimer.current = setTimeout(() => {
      setState('blinking');
      setTimeout(() => setState('idle'), 160);
    }, 2000);
    return () => {
      clearTimeout(id);
      clearTimeout(smileTimer.current);
    };
  }, [smileTrigger]);

  const closed = state === 'blinking' || state === 'smiling';
  const happy = state === 'smiling';
  const c = '#4338ca';

  return (
    <svg
      className={`${styles.cat} ${className ?? ''}`}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Kawaii cat"
    >
      {/* ── Head (rounded) ── */}
      <path
        stroke={c}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        d="M8 34c0 13.255 10.745 24 24 24s24-10.745 24-24"
      />

      {/* ── Left ear ── */}
      <path
        stroke={c}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        d="M8 34V10c0-2.2 2.6-3.3 4.1-1.7L22 18"
      />

      {/* ── Right ear ── */}
      <path
        stroke={c}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        d="M56 34V10c0-2.2-2.6-3.3-4.1-1.7L42 18"
      />

      {/* ── Forehead ── */}
      <path
        stroke={c}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        d="M22 18c3-2.2 6.5-3.2 10-3.2s7 1 10 3.2"
      />

      {/* ── Eyes ── */}
      {happy ? (
        <>
          <path
            d="M19 33 Q24 26 29 33"
            stroke={c}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M35 33 Q40 26 45 33"
            stroke={c}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </>
      ) : closed ? (
        <>
          <line x1="20" y1="32" x2="28" y2="32" stroke={c} strokeWidth="3" strokeLinecap="round" />
          <line x1="36" y1="32" x2="44" y2="32" stroke={c} strokeWidth="3" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="24" cy="32" r="3.5" fill={c} />
          <circle cx="40" cy="32" r="3.5" fill={c} />
        </>
      )}

      {/* ── Nose (inverted triangle) ── */}
      <path d="M30 41 L32 44 L34 41 Z" fill={c} />

      {/* ── Mouth (ω shape) ── */}
      <path
        d="M27 46 Q30 50 32 46 Q34 50 37 46"
        stroke={c}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── Whiskers ── */}
      <g stroke={c} strokeWidth="2" strokeLinecap="round" opacity="0.35">
        <line x1="18" y1="42" x2="3" y2="40" />
        <line x1="17" y1="47" x2="2" y2="49" />
        <line x1="46" y1="42" x2="61" y2="40" />
        <line x1="47" y1="47" x2="62" y2="49" />
      </g>
    </svg>
  );
}
