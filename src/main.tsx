import '@/global-styles/index.scss';
// Buffer polyfill required by @react-pdf/renderer in the browser
import { Buffer as BufferPolyfill } from 'buffer';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).Buffer = (globalThis as any).Buffer ?? BufferPolyfill;
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
