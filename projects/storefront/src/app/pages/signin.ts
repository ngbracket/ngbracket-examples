import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  NgbrLoginForm,
  NgbrSignupForm,
  NgbrAuthDivider,
  NgbrProviderButton,
} from '@ngbracket/auth';
import type { NgbrLoginValue, NgbrSignupValue, NgbrAuthProvider } from '@ngbracket/auth';

/** Customer sign-in / register (auth pack). Demo only — nothing is persisted. */
@Component({
  selector: 'store-signin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgbrLoginForm, NgbrSignupForm, NgbrAuthDivider, NgbrProviderButton],
  template: `
    <div class="auth">
      <a class="back" routerLink="/">← Back to Aurora</a>

      @if (done()) {
        <p class="ok" role="status">{{ done() }} <a routerLink="/shop">Start shopping →</a></p>
      } @else if (mode() === 'login') {
        <h1>Sign in</h1>
        <ngbr-login-form (submit)="onLogin($event)">
          <a ngbrAuthAside href="javascript:void(0)">Forgot password?</a>
          <div ngbrAuthExtra>
            <ngbr-auth-divider label="or continue with" />
            <ngbr-provider-button provider="google" (selected)="onProvider($event)" />
            <ngbr-provider-button provider="apple" (selected)="onProvider($event)" />
          </div>
        </ngbr-login-form>
        <p class="switch">
          New here?
          <button type="button" (click)="mode.set('signup')">Create an account</button>
        </p>
      } @else {
        <h1>Create your account</h1>
        <ngbr-signup-form (submit)="onSignup($event)">
          <span ngbrAuthTerms>I agree to the terms of service and privacy policy.</span>
        </ngbr-signup-form>
        <p class="switch">
          Already have an account?
          <button type="button" (click)="mode.set('login')">Sign in</button>
        </p>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: grid;
        place-items: center;
        min-height: 80vh;
        padding: 24px;
      }
      .auth {
        width: 100%;
        max-width: 420px;
      }
      .back {
        display: inline-block;
        margin-bottom: 20px;
        color: var(--ngbr-color-accent);
      }
      h1 {
        margin: 0 0 18px;
      }
      .switch {
        margin-top: 18px;
        color: var(--ngbr-color-text-muted);
      }
      .switch button {
        font: inherit;
        color: var(--ngbr-color-accent);
        background: none;
        border: 0;
        padding: 0;
        cursor: pointer;
        text-decoration: underline;
      }
      .ok {
        color: var(--ngbr-color-accent);
        font-weight: 600;
      }
    `,
  ],
})
export class Signin {
  protected readonly mode = signal<'login' | 'signup'>('login');
  protected readonly done = signal('');

  protected onLogin(value: NgbrLoginValue): void {
    this.done.set(`Signed in as ${value.email}.`);
  }
  protected onSignup(value: NgbrSignupValue): void {
    this.done.set(`Account created for ${value.email}.`);
  }
  protected onProvider(_provider: NgbrAuthProvider): void {
    this.done.set('Signed in.');
  }
}
