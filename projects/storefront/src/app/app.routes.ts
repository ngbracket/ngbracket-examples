import { ResolveFn, Routes } from '@angular/router';
import { productById } from './data/shop-data';

const productTitle: ResolveFn<string> = (route) => productById(route.paramMap.get('id') ?? '')?.title ?? 'Product';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shell/store-shell').then((m) => m.StoreShell),
    children: [
      { path: '', loadComponent: () => import('./pages/landing').then((m) => m.Landing) },
      { path: 'shop', title: 'Shop all', loadComponent: () => import('./pages/shop').then((m) => m.Shop) },
      { path: 'product/:id', title: productTitle, loadComponent: () => import('./pages/product').then((m) => m.Product) },
      { path: 'checkout', title: 'Checkout', loadComponent: () => import('./pages/checkout').then((m) => m.Checkout) },
      { path: 'signin', title: 'Sign in', loadComponent: () => import('./pages/signin').then((m) => m.Signin) },
    ],
  },
  { path: '**', redirectTo: '' },
];
