import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthState } from './auth-state';

/** Redirects to /login when there's no signed-in user. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthState);
  const router = inject(Router);
  return auth.user() ? true : router.createUrlTree(['/login']);
};
