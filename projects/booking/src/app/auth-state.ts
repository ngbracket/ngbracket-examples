import { Injectable, signal } from '@angular/core';

/** Toy in-memory auth — any credentials sign you in. Gates the booking routes. */
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
