/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { type RouteObject } from 'react-router-dom';

import styles from './routeConfig.module.scss';

const Home = lazy(() => import('@pages/Home/Home').then((m) => ({ default: m.Home })));
const Converter = lazy(() =>
  import('@pages/Converter/Converter').then((m) => ({ default: m.Converter })),
);
const About = lazy(() => import('@pages/About/About').then((m) => ({ default: m.About })));

function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className={styles.loadingFallback}>
          <span>Loading...</span>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <LazyPage>
        <Home />
      </LazyPage>
    ),
  },
  {
    path: '/converter',
    element: (
      <LazyPage>
        <Converter />
      </LazyPage>
    ),
  },
  {
    path: '/about',
    element: (
      <LazyPage>
        <About />
      </LazyPage>
    ),
  },
];
