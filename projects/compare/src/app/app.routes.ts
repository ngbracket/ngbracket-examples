import { Routes } from '@angular/router';

import { OrdersStore } from './data/orders';

// Each version gets its own OrdersStore, so an edit on one page doesn't show on the other.
export const routes: Routes = [
  {
    path: '',
    title: 'Orders: before and after',
    loadComponent: () => import('./intro').then((m) => m.Intro),
  },
  {
    path: 'before',
    title: 'Before: orders built by hand',
    providers: [OrdersStore],
    loadComponent: () => import('./before/orders-before').then((m) => m.OrdersBefore),
  },
  {
    path: 'after',
    title: 'After: orders built with NgBracket',
    providers: [OrdersStore],
    loadComponent: () => import('./after/orders-after').then((m) => m.OrdersAfter),
  },
  { path: '**', redirectTo: '' },
];
