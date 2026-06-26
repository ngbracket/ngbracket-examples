import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shell/store-shell').then((m) => m.StoreShell),
    children: [
      { path: '', loadComponent: () => import('./pages/landing').then((m) => m.Landing) },
      { path: 'shop', loadComponent: () => import('./pages/shop').then((m) => m.Shop) },
      { path: 'product/:id', loadComponent: () => import('./pages/product').then((m) => m.Product) },
      { path: 'checkout', loadComponent: () => import('./pages/checkout').then((m) => m.Checkout) },
      { path: 'signin', loadComponent: () => import('./pages/signin').then((m) => m.Signin) },
    ],
  },
  { path: '**', redirectTo: '' },
];
