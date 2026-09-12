/*
 * Public API surface of `shared` — cross-app utilities used by the example apps
 * (admin, storefront, booking, editor, overlays, kb).
 */

export { ThemeService } from './lib/theme.service';
export type { Theme } from './lib/theme.service';
export { ThemeToggle } from './lib/theme-toggle';
export { SkipLink } from './lib/skip-link';
export { provideExampleA11y } from './lib/a11y';
