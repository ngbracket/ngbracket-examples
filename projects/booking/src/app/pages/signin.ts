import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgbrLoginForm } from '@ngbracket/auth';
import type { NgbrLoginValue } from '@ngbracket/auth';
import { ThemeToggle } from 'shared';

import { AuthState } from '../auth-state';

/** Sign-in screen (auth pack). Any credentials are accepted in this demo. */
@Component({
  selector: 'booking-signin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgbrLoginForm, ThemeToggle],
  template: `
    <div class="signin">
      <div class="signin__top">
        <strong class="brand">Trim &amp; Co.</strong>
        <app-theme-toggle />
      </div>
      <h1>Book your appointment</h1>
      <p class="hint">Sign in to manage bookings. Demo only — any details work.</p>
      <ngbr-login-form (submit)="onSubmit($event)">
        <a ngbrAuthAside href="javascript:void(0)">Forgot password?</a>
      </ngbr-login-form>
    </div>
  `,
  styles: [
    `
      :host {
        display: grid;
        place-items: center;
        min-height: 100dvh;
        padding: 24px;
      }
      .signin {
        width: 100%;
        max-width: 420px;
      }
      .signin__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 28px;
      }
      .brand {
        font-size: 1.3rem;
        color: var(--ngbr-color-accent);
      }
      h1 {
        margin: 0 0 4px;
      }
      .hint {
        margin: 0 0 20px;
        color: var(--ngbr-color-text-muted);
        font-size: 0.9rem;
      }
    `,
  ],
})
export class Signin {
  private readonly auth = inject(AuthState);
  private readonly router = inject(Router);

  protected onSubmit(value: NgbrLoginValue): void {
    this.auth.signIn(value.email || 'guest@trim.co');
    void this.router.navigate(['/book']);
  }
}
