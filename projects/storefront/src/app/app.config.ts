import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, TitleStrategy, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideExampleA11y } from 'shared';

import { routes } from './app.routes';
import { StoreTitleStrategy } from './title-strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
    ),
    { provide: TitleStrategy, useClass: StoreTitleStrategy },
    // Dev-only in-app accessibility auditing (overlay + grouped console report).
    provideExampleA11y(),
  ],
};
