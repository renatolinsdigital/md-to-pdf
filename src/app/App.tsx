import { Suspense } from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { routes } from '@routes/routeConfig';
import { Navbar } from '@shared/components/Navbar/Navbar';
import { Footer } from '@shared/components/Footer/Footer';
import { ToastProvider } from '@shared/components/Toast/ToastProvider';
import styles from './App.module.scss';

function AppRoutes() {
  const element = useRoutes(routes);
  return (
    <main className={styles.main}>
      {/* Pages are lazy-loaded; this shows while a page's chunk downloads */}
      <Suspense fallback={<div className={styles.pageLoading}>Loading...</div>}>{element}</Suspense>
    </main>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className={styles.app}>
          <Navbar />
          <AppRoutes />
          <Footer />
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}
