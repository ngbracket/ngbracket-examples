import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { ThemeToggle } from 'shared';

import { AuthState } from '../auth-state';

/** Authenticated booking layout: top nav + routed content. */
@Component({
  selector: 'booking-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, ThemeToggle],
  template: `
    <header class="top">
      <a class="brand" routerLink="/book">Trim &amp; Co.</a>
      <nav class="nav" aria-label="Primary">
        <a routerLink="/book" routerLinkActive="is-active">Book</a>
        <a routerLink="/calendar" routerLinkActive="is-active">Calendar</a>
        <a routerLink="/availability" routerLinkActive="is-active">Availability</a>
      </nav>
      <div class="end">
        <app-theme-toggle />
        <button type="button" class="signout" (click)="signOut()">Sign out</button>
      </div>
    </header>

    <main class="content">
      <router-outlet />
    </main>
  `,
  styles: [
    `
      .top {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 12px clamp(16px, 4vw, 28px);
        background: var(--app-surface);
        border-bottom: 1px solid var(--ngbr-color-border);
        position: sticky;
        top: 0;
        z-index: 20;
      }
      .brand {
        font-weight: 700;
        font-size: 1.1rem;
        color: var(--ngbr-color-accent);
        text-decoration: none;
      }
      .nav {
        display: flex;
        gap: 4px;
        margin-right: auto;
      }
      .nav a {
        padding: 8px 12px;
        border-radius: var(--ngbr-radius);
        color: var(--ngbr-color-text-muted);
        text-decoration: none;
        font-weight: 600;
      }
      .nav a.is-active {
        color: var(--ngbr-color-accent);
        background: color-mix(in srgb, var(--ngbr-color-accent) 12%, transparent);
      }
      .nav a:focus-visible,
      .signout:focus-visible {
        outline: 2px solid var(--ngbr-color-accent);
        outline-offset: 2px;
      }
      .end {
        display: flex;
        align-items: center;
        gap: 10px;
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
      .content {
        max-width: 1080px;
        margin-inline: auto;
        padding: clamp(20px, 4vw, 36px) clamp(16px, 5vw, 28px) 56px;
      }
      @media (max-width: 560px) {
        .nav a {
          padding: 8px 8px;
        }
      }
    `,
  ],
})
export class BookingShell {
  private readonly auth = inject(AuthState);
  private readonly router = inject(Router);

  protected signOut(): void {
    this.auth.signOut();
    void this.router.navigate(['/signin']);
  }
}
