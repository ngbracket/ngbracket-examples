import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { ThemeService } from './theme.service';

/**
 * A single accessible button that toggles light/dark. `aria-pressed` conveys
 * the current state; the visible glyph is decorative.
 */
@Component({
  selector: 'app-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-theme-toggle' },
  template: `
    <button
      type="button"
      class="tt__btn"
      [attr.aria-pressed]="isDark()"
      [attr.aria-label]="label()"
      [title]="label()"
      (click)="theme.toggle()"
    >
      <span aria-hidden="true">{{ isDark() ? '☀️' : '🌙' }}</span>
    </button>
  `,
  styles: [
    `
      .tt__btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        font-size: 1.1rem;
        line-height: 1;
        color: var(--ngbr-color-text, #1a1c1e);
        background: var(--ngbr-color-surface, #fff);
        border: 1px solid var(--ngbr-color-border, #c4c7c9);
        border-radius: var(--ngbr-radius, 10px);
        cursor: pointer;
      }
      .tt__btn:focus-visible {
        outline: 2px solid var(--ngbr-color-accent, #0e7490);
        outline-offset: 2px;
      }
    `,
  ],
})
export class ThemeToggle {
  protected readonly theme = inject(ThemeService);
  protected readonly isDark = computed(() => this.theme.theme() === 'dark');
  protected readonly label = computed(() =>
    this.isDark() ? 'Switch to light theme' : 'Switch to dark theme',
  );
}
