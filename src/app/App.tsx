import { BrowserRouter, useRoutes } from 'react-router-dom';
import { routes } from '@routes/routeConfig';
import { Navbar } from '@shared/components/Navbar/Navbar';
import { Footer } from '@shared/components/Footer/Footer';
import { ToastProvider } from '@shared/components/Toast/ToastProvider';
import styles from './App.module.scss';

function AppRoutes() {
  const element = useRoutes(routes);
  return <main className={styles.main}>{element}</main>;
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
