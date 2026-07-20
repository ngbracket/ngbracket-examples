import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgbrAppMenubar } from '@ngbracket/navigation';
import type { NgbrTopMenu } from '@ngbracket/navigation';
import { SkipLink, ThemeToggle } from 'shared';

/** App chrome: navigation-pack menubar + primary links + theme toggle. */
@Component({
  selector: 'kb-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgbrAppMenubar, ThemeToggle, SkipLink],
  template: `
    <app-skip-link />

    <header class="topbar">
      <a class="brand" routerLink="/browse">
        <span class="brand__mark" aria-hidden="true">❯_</span> Almanac
      </a>

      <ngbr-app-menubar [menus]="menus" (action)="onMenuAction($event)" aria-label="Almanac menu" />

      <nav class="primary" aria-label="Primary">
        <a routerLink="/browse" routerLinkActive="active">Browse</a>
        <a routerLink="/articles/new" routerLinkActive="active">New</a>
        <a routerLink="/manage" routerLinkActive="active">Manage</a>
        <a routerLink="/settings" routerLinkActive="active">Settings</a>
      </nav>

      <app-theme-toggle />
    </header>

    @if (notice(); as n) {
      <p class="notice" role="status">{{ n }}</p>
    }

    <main id="main-content" tabindex="-1" class="main">
      <router-outlet />
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100dvh;
        background: var(--app-bg, var(--ngbr-color-surface));
      }
      .topbar {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 10px clamp(12px, 3vw, 24px);
        border-bottom: 1px solid var(--ngbr-color-border);
        background: var(--ngbr-color-surface);
        position: sticky;
        top: 0;
        z-index: 20;
      }
      .brand {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-weight: 700;
        font-size: 1.05rem;
        color: var(--ngbr-color-text);
        text-decoration: none;
      }
      .brand__mark {
        color: var(--ngbr-color-accent);
        font-family: ui-monospace, monospace;
      }
      .primary {
        display: flex;
        gap: 4px;
        margin-left: auto;
      }
      .primary a {
        padding: 7px 12px;
        border-radius: var(--ngbr-radius);
        color: var(--ngbr-color-text-muted);
        text-decoration: none;
        font-size: 0.92rem;
      }
      .primary a:hover {
        background: color-mix(in srgb, var(--ngbr-color-text) 6%, transparent);
        color: var(--ngbr-color-text);
      }
      .primary a.active {
        color: var(--ngbr-color-accent);
        background: color-mix(in srgb, var(--ngbr-color-accent) 12%, transparent);
      }
      .primary a:focus-visible {
        outline: 2px solid var(--ngbr-color-accent);
        outline-offset: 2px;
      }
      .notice {
        margin: 0;
        padding: 10px clamp(12px, 3vw, 24px);
        background: color-mix(in srgb, var(--ngbr-color-accent) 12%, transparent);
        color: var(--ngbr-color-text);
        font-size: 0.9rem;
      }
      .main {
        padding: clamp(16px, 3vw, 28px);
      }
      @media (max-width: 720px) {
        .primary {
          display: none;
        }
      }
    `,
  ],
})
export class KbShell {
  private readonly router = inject(Router);
  protected readonly notice = signal('');

  protected readonly menus: readonly NgbrTopMenu[] = [
    {
      label: 'File',
      items: [
        { label: 'New article', value: 'new', shortcut: '⌘N' },
        { separator: true },
        { label: 'Manage articles', value: 'manage' },
      ],
    },
    {
      label: 'View',
      items: [
        { label: 'Browse', value: 'browse' },
        { label: 'Settings', value: 'settings' },
      ],
    },
    {
      label: 'Help',
      items: [{ label: 'About Almanac', value: 'about' }],
    },
  ];

  protected onMenuAction(value: string): void {
    this.notice.set('');
    switch (value) {
      case 'new':
        void this.router.navigate(['/articles/new']);
        break;
      case 'manage':
        void this.router.navigate(['/manage']);
        break;
      case 'browse':
        void this.router.navigate(['/browse']);
        break;
      case 'settings':
        void this.router.navigate(['/settings']);
        break;
      case 'about':
        this.notice.set('Almanac — an accessible knowledge base built with NgBracket (navigation · structure · editor).');
        break;
    }
  }
}
