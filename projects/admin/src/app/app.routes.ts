import { isDevMode } from '@angular/core';
import { Routes } from '@angular/router';

import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login').then((m) => m.Login),
  },
  // Dev-only accessibility showcase (all four overlay severity colours).
  // Registered only in dev so it never ships to production.
  ...(isDevMode()
    ? [
        {
          path: 'a11y-demo',
          loadComponent: () => import('./pages/a11y-demo').then((m) => m.A11yDemo),
        },
      ]
    : []),
  {
    path: '',
    loadComponent: () => import('./shell/admin-shell').then((m) => m.AdminShell),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      { path: 'overview', loadComponent: () => import('./pages/overview').then((m) => m.Overview) },
      { path: 'customers', loadComponent: () => import('./pages/customers').then((m) => m.Customers) },
      { path: 'settings', loadComponent: () => import('./pages/settings').then((m) => m.Settings) },
    ],
  },
  { path: '**', redirectTo: '' },
];
