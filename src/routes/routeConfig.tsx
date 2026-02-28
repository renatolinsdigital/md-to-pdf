import { lazy, Suspense } from 'react';
import { type RouteObject } from 'react-router-dom';

const Home = lazy(() => import('@pages/Home/Home').then((m) => ({ default: m.Home })));
const Converter = lazy(() =>
  import('@pages/Converter/Converter').then((m) => ({ default: m.Converter })),
);
const About = lazy(() => import('@pages/About/About').then((m) => ({ default: m.About })));

function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
          }}
        >
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
