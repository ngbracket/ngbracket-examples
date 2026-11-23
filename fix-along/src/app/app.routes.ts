import { ActivatedRouteSnapshot, Routes } from '@angular/router';

import { REPORTS } from './data';

function reportTitle(route: ActivatedRouteSnapshot): string {
  const report = REPORTS.find((r) => r.slug === route.paramMap.get('slug'));
  return `${report?.label ?? 'Unknown'} report | Ops`;
}

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'orders' },
  {
    path: 'orders',
    title: 'Orders | Ops',
    loadComponent: () => import('./orders/orders').then((m) => m.Orders),
  },
  {
    path: 'customers',
    title: 'Customers | Ops',
    loadComponent: () => import('./customers/customers').then((m) => m.Customers),
  },
  {
    path: 'reports/:slug',
    title: reportTitle,
    loadComponent: () => import('./reports/report').then((m) => m.Report),
  },
  { path: '**', redirectTo: 'orders' },
];
