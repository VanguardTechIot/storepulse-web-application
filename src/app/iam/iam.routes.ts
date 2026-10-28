import { Routes } from '@angular/router';
import { passwordRecoveryGuard } from './presentation/iam.guards';
import { iamPaths } from './presentation/iam.nav';

/**
 * Routes for the Identity and Access Management feature.
 *
 * Route titles are i18n keys translated by `TranslatedTitleStrategy`.
 */
export const IDENTITY_ACCESS_MANAGEMENT_ROUTES: Routes = [
  /** Redirects the feature root to the welcome page. */
  { path: '', pathMatch: 'full', redirectTo: iamPaths.welcome },
  /** Displays the IAM welcome page. */
  {
    path: iamPaths.welcome,
    title: 'iam.welcome.page_title',
    loadComponent: () => import('./presentation/views/welcome/welcome').then((m) => m.Welcome),
  },
  /** Displays the sign-in page. */
  {
    path: iamPaths.signIn,
    title: 'iam.sign_in.page_title',
    loadComponent: () => import('./presentation/views/sign-in/sign-in').then((m) => m.SignIn),
  },
  /** Displays the account registration page. */
  {
    path: iamPaths.signUp,
    title: 'iam.sign_up.page_title',
    loadComponent: () => import('./presentation/views/sign-up/sign-up').then((m) => m.SignUp),
  },
  /** Displays the password recovery request page. */
  {
    path: iamPaths.forgotPassword,
    title: 'iam.forgot_password.page_title',
    loadComponent: () =>
      import('./presentation/views/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  /** Displays the password reset page when a valid recovery session exists. */
  {
    path: iamPaths.resetPassword,
    title: 'iam.reset_password.page_title',
    canActivate: [passwordRecoveryGuard],
    loadComponent: () =>
      import('./presentation/views/reset-password/reset-password').then((m) => m.ResetPassword),
  },
];
