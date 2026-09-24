import { EnvironmentProviders, isDevMode, makeEnvironmentProviders } from '@angular/core';
import { provideA11yDevtools } from '@ngbracket/a11y-devtools';

/**
 * Dev-only in-app accessibility auditing for the example apps: logs each axe
 * violation grouped by the component that rendered it, draws the overlay, and
 * turns on the keyboard layer — tab-order visualisation, keyboard-reachability
 * findings, and the focus-follow accessibility-tree preview (Tab through a page
 * to see each control's computed role/name/state).
 *
 * A no-op in production (axe-core is never bundled and it tree-shakes away), so
 * it's safe to add to any app's root providers unconditionally.
 */
export function provideExampleA11y(): EnvironmentProviders {
  return isDevMode()
    ? provideA11yDevtools({ log: true, overlay: true, keyboard: true })
    : makeEnvironmentProviders([]);
}
