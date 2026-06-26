import { Routes } from '@angular/router';

import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: 'signin',
    loadComponent: () => import('./pages/signin').then((m) => m.Signin),
  },
  {
    path: '',
    loadComponent: () => import('./shell/booking-shell').then((m) => m.BookingShell),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'book' },
      { path: 'book', loadComponent: () => import('./pages/book').then((m) => m.Book) },
      { path: 'calendar', loadComponent: () => import('./pages/calendar').then((m) => m.Calendar) },
      { path: 'availability', loadComponent: () => import('./pages/availability').then((m) => m.Availability) },
    ],
  },
  { path: '**', redirectTo: '' },
];
