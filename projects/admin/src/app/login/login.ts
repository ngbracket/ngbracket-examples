import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgbrLoginForm, NgbrAuthDivider, NgbrProviderButton } from '@ngbracket/auth';
import type { NgbrLoginValue, NgbrAuthProvider } from '@ngbracket/auth';
import { ThemeToggle } from 'shared';

import { AuthState } from '../auth-state';

/** Sign-in screen (auth pack). Any credentials are accepted in this demo. */
@Component({
  selector: 'admin-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgbrLoginForm, NgbrAuthDivider, NgbrProviderButton, ThemeToggle],
  template: `
    <div class="login">
      <div class="login__top">
        <strong class="login__brand">Helm</strong>
        <app-theme-toggle />
      </div>
      <h1 class="login__title">Sign in to your workspace</h1>
      <p class="login__hint">Demo only — any email and password will sign you in.</p>
      <ngbr-login-form (submit)="onSubmit($event)">
        <a ngbrAuthAside href="javascript:void(0)">Forgot password?</a>
        <div ngbrAuthExtra>
          <ngbr-auth-divider label="or continue with" />
          <ngbr-provider-button provider="google" (selected)="onProvider($event)" />
          <ngbr-provider-button provider="github" (selected)="onProvider($event)" />
        </div>
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
      .login {
        width: 100%;
        max-width: 420px;
      }
      .login__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 28px;
      }
      .login__brand {
        font-size: 1.4rem;
        color: var(--ngbr-color-accent);
      }
      .login__title {
        margin: 0 0 4px;
        font-size: 1.5rem;
        color: var(--ngbr-color-text);
      }
      .login__hint {
        margin: 0 0 20px;
        color: var(--ngbr-color-text-muted);
        font-size: 0.9rem;
      }
    `,
  ],
})
export class Login {
  private readonly auth = inject(AuthState);
  private readonly router = inject(Router);

  protected onSubmit(value: NgbrLoginValue): void {
    this.auth.signIn(value.email || 'admin@helm.app');
    void this.router.navigate(['/overview']);
  }

  protected onProvider(_provider: NgbrAuthProvider): void {
    this.auth.signIn('demo@helm.app');
    void this.router.navigate(['/overview']);
  }
}
