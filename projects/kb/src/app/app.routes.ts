import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shell/kb-shell').then((m) => m.KbShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'browse' },
      { path: 'browse', loadComponent: () => import('./pages/browse').then((m) => m.Browse) },
      {
        path: 'articles/new',
        loadComponent: () => import('./pages/article-form').then((m) => m.ArticleForm),
      },
      {
        path: 'articles/:id/edit',
        loadComponent: () => import('./pages/article-form').then((m) => m.ArticleForm),
      },
      { path: 'manage', loadComponent: () => import('./pages/manage').then((m) => m.Manage) },
      { path: 'settings', loadComponent: () => import('./pages/settings').then((m) => m.Settings) },
    ],
  },
  { path: '**', redirectTo: '' },
];
