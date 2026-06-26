import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthState } from './auth-state';

/** Redirects to /signin when there's no signed-in user. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthState);
  const router = inject(Router);
  return auth.user() ? true : router.createUrlTree(['/signin']);
};
