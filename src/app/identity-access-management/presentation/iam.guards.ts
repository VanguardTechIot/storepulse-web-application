import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { appNav } from '../../shared/routing/app-nav';
import { IamStore } from '../application/iam.store';
import { iamNav } from './iam.nav';

/** Protects the authenticated area: guests are sent to Log In and come back afterwards. */
export const authenticationGuard: CanActivateFn = (_route, state) => {
  const store = inject(IamStore);
  const router = inject(Router);
  return (
    store.isSignedIn() ||
    router.createUrlTree(iamNav.signIn(), { queryParams: { returnUrl: state.url } })
  );
};

/** Keeps signed-in users out of the welcome, Log In and registration screens. */
export const guestGuard: CanActivateFn = () => {
  const store = inject(IamStore);
  const router = inject(Router);
  return !store.isSignedIn() || router.createUrlTree(appNav.home);
};

/** The code can only be entered after it was requested in this visit. */
export const passwordRecoveryGuard: CanActivateFn = () => {
  const store = inject(IamStore);
  const router = inject(Router);
  return store.passwordRecovery() !== null || router.createUrlTree(iamNav.forgotPassword());
};
