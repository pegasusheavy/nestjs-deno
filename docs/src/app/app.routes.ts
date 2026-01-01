import { Routes } from '@angular/router';
import { Layout } from './layout/layout';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home').then((m) => m.Home),
      },
      {
        path: 'introduction',
        loadComponent: () => import('./pages/introduction/introduction').then((m) => m.Introduction),
      },
      {
        path: 'installation',
        loadComponent: () => import('./pages/installation/installation').then((m) => m.Installation),
      },
      {
        path: 'getting-started',
        loadComponent: () =>
          import('./pages/getting-started/getting-started').then((m) => m.GettingStarted),
      },
      {
        path: 'api',
        loadComponent: () => import('./pages/api/api').then((m) => m.Api),
      },
      {
        path: 'express-compat',
        loadComponent: () =>
          import('./pages/express-compat/express-compat').then((m) => m.ExpressCompat),
      },
      {
        path: 'fastify-compat',
        loadComponent: () =>
          import('./pages/fastify-compat/fastify-compat').then((m) => m.FastifyCompat),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
