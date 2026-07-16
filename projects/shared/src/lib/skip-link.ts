import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * "Skip to main content" link — the first focusable element in the app. It's
 * off-screen until focused, then slides in; activating it moves focus to the
 * element with `id="main-content"` (which must carry `tabindex="-1"`). Satisfies
 * WCAG 2.4.1 (Bypass Blocks) so keyboard users can jump past the header/nav.
 */
@Component({
  selector: 'app-skip-link',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<a class="skip" href="#main-content" (click)="skip($event)">Skip to main content</a>`,
  styles: [
    `
      .skip {
        position: fixed;
        left: 12px;
        top: 12px;
        z-index: 2000;
        padding: 10px 16px;
        font: inherit;
        font-weight: 600;
        color: var(--ngbr-color-accent-contrast, #fff);
        background: var(--ngbr-color-accent, #0e7490);
        border-radius: 8px;
        text-decoration: none;
        transform: translateY(calc(-100% - 16px));
        transition: transform 0.15s ease;
      }
      .skip:focus {
        transform: translateY(0);
        outline: 2px solid var(--ngbr-color-accent-contrast, #fff);
        outline-offset: 2px;
      }
    `,
  ],
})
export class SkipLink {
  protected skip(event: Event): void {
    event.preventDefault();
    const main = document.getElementById('main-content');
    if (main) {
      main.focus();
      main.scrollIntoView();
    }
  }
}
