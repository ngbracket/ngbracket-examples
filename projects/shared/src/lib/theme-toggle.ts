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
      class="tt"
      role="switch"
      [attr.aria-checked]="isDark()"
      [attr.aria-label]="label()"
      [title]="label()"
      (click)="theme.toggle()"
    >
      <span class="tt__track" aria-hidden="true">
        <span class="tt__thumb">{{ isDark() ? '🌙' : '☀️' }}</span>
      </span>
      <span class="tt__label">{{ isDark() ? 'Dark mode' : 'Light mode' }}</span>
    </button>
  `,
  styles: [
    `
      .tt {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        height: 40px;
        padding: 0 12px 0 6px;
        font: inherit;
        font-size: 0.9rem;
        color: var(--ngbr-color-text, #1a1c1e);
        background: var(--ngbr-color-surface, #fff);
        border: 1px solid var(--ngbr-color-border, #c4c7c9);
        border-radius: 999px;
        cursor: pointer;
      }
      .tt__track {
        position: relative;
        display: inline-flex;
        align-items: center;
        width: 44px;
        height: 24px;
        padding: 2px;
        border-radius: 999px;
        background: color-mix(in srgb, var(--ngbr-color-text, #1a1c1e) 18%, transparent);
        transition: background 0.15s ease;
      }
      .tt[aria-checked='true'] .tt__track {
        background: var(--ngbr-color-accent, #0e7490);
      }
      .tt__thumb {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        font-size: 0.72rem;
        line-height: 1;
        border-radius: 50%;
        background: #fff;
        transition: transform 0.15s ease;
      }
      .tt[aria-checked='true'] .tt__thumb {
        transform: translateX(20px);
      }
      .tt__label {
        white-space: nowrap;
      }
      .tt:focus-visible {
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
