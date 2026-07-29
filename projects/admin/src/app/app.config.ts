import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideNgbrCommandHotkey } from '@ngbracket/command';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // ⌘K / Ctrl+K opens the command palette app-wide (guarded against inputs).
    provideNgbrCommandHotkey(),
  ],
};
