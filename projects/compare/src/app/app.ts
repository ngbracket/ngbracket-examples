import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, skip } from 'rxjs';
import { SkipLink, ThemeToggle } from 'shared';

/**
 * Page chrome shared by both versions: skip link, the version switcher and the
 * theme toggle. Only the orders screen inside <main> differs between them.
 */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SkipLink, ThemeToggle],
  template: `
    <app-skip-link />
    <header class="chrome">
      <a class="brand" routerLink="/"><span class="brand__mark" aria-hidden="true">◇</span> Orders: before and after</a>
      <nav aria-label="Versions">
        <ul class="versions">
          <li>
            <a routerLink="/" routerLinkActive="is-active" ariaCurrentWhenActive="page" [routerLinkActiveOptions]="{ exact: true }">About</a>
          </li>
          <li><a routerLink="/before" routerLinkActive="is-active" ariaCurrentWhenActive="page">Before</a></li>
          <li><a routerLink="/after" routerLinkActive="is-active" ariaCurrentWhenActive="page">After</a></li>
        </ul>
      </nav>
      <app-theme-toggle />
    </header>
    <main #main id="main-content" tabindex="-1" class="page">
      <router-outlet />
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100dvh;
        background: var(--app-bg, #f6f8f9);
        color: var(--ngbr-color-text, #1a1c1e);
      }
      .chrome {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px 20px;
        padding: 10px 16px;
        background: var(--ngbr-color-surface, #fff);
        border-bottom: 1px solid var(--ngbr-color-border, #c4c7c9);
      }
      .brand {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-weight: 700;
        color: inherit;
        text-decoration: none;
      }
      .brand__mark {
        color: var(--ngbr-color-accent, #0e7490);
        font-size: 1.2rem;
      }
      nav {
        margin-inline-end: auto;
      }
      .versions {
        display: flex;
        gap: 4px;
        margin: 0;
        padding: 0;
        list-style: none;
      }
      .versions a {
        display: inline-block;
        padding: 6px 12px;
        border-radius: 8px;
        color: var(--ngbr-color-text, #1a1c1e);
        text-decoration: none;
        font-weight: 600;
      }
      .versions a:hover {
        background: color-mix(in srgb, var(--ngbr-color-text, #1a1c1e) 8%, transparent);
      }
      .versions a.is-active {
        color: var(--ngbr-color-accent-contrast, #fff);
        background: var(--ngbr-color-accent, #0e7490);
      }
      .page {
        max-width: 1040px;
        margin: 0 auto;
        padding: 28px 16px 64px;
      }
      .page:focus {
        outline: none;
      }
    `,
  ],
})
export class App {
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');
  private readonly injector = inject(Injector);

  constructor() {
    // After moving between versions, put focus on the new page's heading, so a
    // screen reader reads "Orders, heading level 1" and the next Tab starts in
    // the page, not on the link that was used. Falls back to <main>.
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        skip(1),
        takeUntilDestroyed(),
      )
      .subscribe(() =>
        afterNextRender(
          () => {
            const main = this.main().nativeElement;
            const heading = main.querySelector('h1');
            if (heading) {
              heading.setAttribute('tabindex', '-1');
              heading.focus();
            } else {
              main.focus();
            }
          },
          { injector: this.injector },
        ),
      );
  }
}
