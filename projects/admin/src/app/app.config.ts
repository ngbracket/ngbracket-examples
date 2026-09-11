import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideNgbrCommandHotkey } from '@ngbracket/command';
import { provideA11yDevtools } from '@ngbracket/a11y-devtools';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // ⌘K / Ctrl+K opens the command palette app-wide (guarded against inputs).
    provideNgbrCommandHotkey(),
    // Dev-only in-app accessibility auditing. `isDevMode()` keeps it out of the
    // provider list in prod; it also tree-shakes entirely out of prod builds.
    ...(isDevMode() ? [provideA11yDevtools({ log: true, overlay: true })] : []),
  ],
};
