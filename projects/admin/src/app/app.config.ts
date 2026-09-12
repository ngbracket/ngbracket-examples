import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideNgbrCommandHotkey } from '@ngbracket/command';
import { provideExampleA11y } from 'shared';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // ⌘K / Ctrl+K opens the command palette app-wide (guarded against inputs).
    provideNgbrCommandHotkey(),
    // Dev-only in-app accessibility auditing (overlay + grouped console report).
    provideExampleA11y(),
  ],
};
