import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { appNav } from '../../shared/routing/app-nav';
import { IamStore } from '../application/iam.store';
import { iamNav } from './iam.nav';

/**
 * Protects authenticated routes and redirects guests to sign-in.
 *
 * The requested URL is preserved so users can return after signing in.
 */
export const authenticationGuard: CanActivateFn = (_route, state) => {
  const store = inject(IamStore);
  const router = inject(Router);
  return (
    store.isSignedIn() ||
    router.createUrlTree(iamNav.signIn(), { queryParams: { returnUrl: state.url } })
  );
};

/**
 * Prevents signed-in users from accessing the welcome, sign-in, and registration pages.
 */
export const guestGuard: CanActivateFn = () => {
  const store = inject(IamStore);
  const router = inject(Router);
  return !store.isSignedIn() || router.createUrlTree(appNav.dashboard);
};

/**
 * Requires an active password recovery before allowing access to the reset page.
 */
export const passwordRecoveryGuard: CanActivateFn = () => {
  const store = inject(IamStore);
  const router = inject(Router);
  return store.passwordRecovery() !== null || router.createUrlTree(iamNav.forgotPassword());
};
