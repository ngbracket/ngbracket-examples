import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./overlays-demo').then((m) => m.OverlaysDemo) },
  { path: '**', redirectTo: '' },
];
