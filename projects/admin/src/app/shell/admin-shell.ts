import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { NgbrAppShell, NgbrSidebarNav, NgbrTopbar } from '@ngbracket/dashboard';
import type { NgbrNavSection } from '@ngbracket/dashboard';
import { NgbrCommandPalette, NgbrCommandRegistry } from '@ngbracket/command';
import { SkipLink, ThemeToggle } from 'shared';

import { AuthState } from '../auth-state';

const ADMIN_NAV: NgbrNavSection[] = [
  {
    items: [
      { id: 'overview', label: 'Overview', icon: '◧' },
      { id: 'customers', label: 'Customers', icon: '☺' },
    ],
  },
  {
    label: 'Account',
    items: [{ id: 'settings', label: 'Settings', icon: '⚙' }],
  },
];

const HEADINGS: Record<string, string> = {
  overview: 'Overview',
  customers: 'Customers',
  settings: 'Settings',
};

/** Authenticated layout: dashboard app-shell + router-driven sidebar nav. */
@Component({
  selector: 'admin-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, NgbrAppShell, NgbrSidebarNav, NgbrTopbar, ThemeToggle, SkipLink],
  template: `
    <app-skip-link />
    <ngbr-app-shell [(drawerOpen)]="drawerOpen" [(collapsed)]="collapsed" style="--ngbr-shell-min-height: 100dvh;">
      <strong ngbrBrand>Helm</strong>

      <ngbr-sidebar-nav
        ngbrSidebar
        [sections]="nav"
        [activeId]="currentId()"
        (activeIdChange)="go($event)"
      />

      <ngbr-topbar ngbrTopbar [heading]="heading()">
        <div ngbrTopbarEnd class="topbar-end">
          <button
            type="button"
            class="cmdk"
            (click)="palette.open()"
            aria-label="Open command palette (Command or Ctrl K)"
            title="Command palette (⌘K)"
          >
            <span aria-hidden="true">⌘K</span>
          </button>
          <app-theme-toggle />
          <span class="who">{{ auth.user() }}</span>
          <button type="button" class="signout" (click)="signOut()">Sign out</button>
        </div>
      </ngbr-topbar>

      <div id="main-content" tabindex="-1" class="page">
        <router-outlet />
      </div>
    </ngbr-app-shell>
  `,
  styles: [
    `
      .topbar-end {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .cmdk {
        padding: 6px 10px;
        font: inherit;
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--ngbr-color-text-muted);
        background: var(--ngbr-color-surface);
        border: 1px solid var(--ngbr-color-border);
        border-radius: var(--ngbr-radius);
        cursor: pointer;
      }
      .cmdk:hover {
        color: var(--ngbr-color-text);
      }
      .cmdk:focus-visible {
        outline: 2px solid var(--ngbr-color-accent);
        outline-offset: 2px;
      }
      .who {
        font-size: 0.85rem;
        color: var(--ngbr-color-text-muted);
      }
      .signout {
        padding: 7px 12px;
        font: inherit;
        color: var(--ngbr-color-text);
        background: var(--ngbr-color-surface);
        border: 1px solid var(--ngbr-color-border);
        border-radius: var(--ngbr-radius);
        cursor: pointer;
      }
      .signout:focus-visible {
        outline: 2px solid var(--ngbr-color-accent);
        outline-offset: 2px;
      }
      .page {
        padding: 24px clamp(16px, 4vw, 32px) 48px;
      }
      @media (max-width: 600px) {
        .who {
          display: none;
        }
      }
    `,
  ],
})
export class AdminShell {
  protected readonly auth = inject(AuthState);
  private readonly router = inject(Router);
  // Dogfood @ngbracket/command: the shell registers the app's commands and the
  // ⌘K palette (opener wired app-wide via provideNgbrCommandHotkey in app.config).
  protected readonly palette = inject(NgbrCommandPalette);
  private readonly registry = inject(NgbrCommandRegistry);

  protected readonly nav = ADMIN_NAV;
  protected readonly drawerOpen = signal(false);
  protected readonly collapsed = signal(false);
  protected readonly currentId = signal(this.idFromUrl(this.router.url));
  protected readonly heading = signal(HEADINGS[this.idFromUrl(this.router.url)] ?? 'Helm');

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((e) => {
        const id = this.idFromUrl(e.urlAfterRedirects);
        this.currentId.set(id);
        this.heading.set(HEADINGS[id] ?? 'Helm');
        this.drawerOpen.set(false);
      });

    // Register this app's commands; clean up if the shell is ever torn down.
    const off = this.registry.register([
      { id: 'go-overview', label: 'Go to Overview', keywords: ['dashboard', 'home'], run: () => this.go('overview') },
      { id: 'go-customers', label: 'Go to Customers', keywords: ['users', 'people'], run: () => this.go('customers') },
      { id: 'go-settings', label: 'Go to Settings', keywords: ['preferences', 'account'], run: () => this.go('settings') },
      { id: 'sign-out', label: 'Sign out', keywords: ['logout', 'log out'], run: () => this.signOut() },
    ]);
    inject(DestroyRef).onDestroy(off);
  }

  protected go(id: string): void {
    void this.router.navigate(['/', id]);
  }

  protected signOut(): void {
    this.auth.signOut();
    void this.router.navigate(['/login']);
  }

  private idFromUrl(url: string): string {
    return url.split('?')[0].split('/').filter(Boolean)[0] ?? 'overview';
  }
}
