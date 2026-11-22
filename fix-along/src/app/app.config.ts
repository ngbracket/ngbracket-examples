import {
  ApplicationConfig,
  isDevMode,
  makeEnvironmentProviders,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideA11yDevtools } from '@ngbracket/a11y-devtools';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    // Dev builds only: axe findings grouped by component, the overlay, and
    // Keyboard & Focus Mode. Production builds leave it out.
    isDevMode()
      ? provideA11yDevtools({ log: true, overlay: true, keyboard: true })
      : makeEnvironmentProviders([]),
  ],
};
