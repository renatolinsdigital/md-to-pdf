// The lazy page components below aren't exported, so Fast Refresh can't patch this file
// in place; edits to it trigger a full reload, which is fine for route config.
/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

// Each page is code-split into its own chunk
const Home = lazy(() => import('@pages/Home/Home').then((m) => ({ default: m.Home })));
const Converter = lazy(() =>
  import('@pages/Converter/Converter').then((m) => ({ default: m.Converter })),
);
const About = lazy(() => import('@pages/About/About').then((m) => ({ default: m.About })));

export const routes: RouteObject[] = [
  { path: '/', element: <Home /> },
  { path: '/converter', element: <Converter /> },
  { path: '/about', element: <About /> },
];
