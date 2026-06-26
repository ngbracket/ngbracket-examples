import { Injectable, signal } from '@angular/core';

/**
 * Toy in-memory auth for the demo — any credentials "work". A real app would
 * back this with a session/token. Used by the route guard + login page.
 */
@Injectable({ providedIn: 'root' })
export class AuthState {
  private readonly _user = signal<string | null>(null);
  readonly user = this._user.asReadonly();

  signIn(email: string): void {
    this._user.set(email);
  }

  signOut(): void {
    this._user.set(null);
  }
}
