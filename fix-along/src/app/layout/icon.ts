import { Component, computed, input } from '@angular/core';

const PATHS = {
  logo: 'M12 2 21 7v10l-9 5-9-5V7z M12 7l4.5 2.5v5L12 17l-4.5-2.5v-5z',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4z M10 20a2 2 0 0 0 4 0',
  help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14 M12 17h.01',
  settings: 'M4 6h10 M18 6h2 M4 12h4 M12 12h8 M4 18h12 M20 18h0 M16 4v4 M10 10v4 M18 16v4',
  orders: 'M3 7l9-4 9 4v10l-9 4-9-4z M3 7l9 4 9-4 M12 11v10',
  customers: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M2 21a7 7 0 0 1 14 0 M17 3.5a4 4 0 0 1 0 7 M22 21a7 7 0 0 0-4-6.3',
  reports: 'M4 20V10 M10 20V4 M16 20v-7 M22 20H2',
  chevron: 'M6 9l6 6 6-6',
} as const;

export type IconName = keyof typeof PATHS;

/**
 * Decorative line icon. Hidden from assistive technology, so the button or
 * link around it must have its own name.
 */
@Component({
  selector: 'app-icon',
  template: `
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="20" height="20">
      <path [attr.d]="path()" />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
    }

    svg {
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  protected readonly path = computed(() => PATHS[this.name()]);
}
