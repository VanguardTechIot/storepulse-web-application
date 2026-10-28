import { Routes } from '@angular/router';
import { passwordRecoveryGuard } from './presentation/iam.guards';
import { iamPaths } from './presentation/iam.nav';

/** Route titles are i18n keys, translated by `TranslatedTitleStrategy`. */
export const IDENTITY_ACCESS_MANAGEMENT_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: iamPaths.welcome },
  {
    path: iamPaths.welcome,
    title: 'iam.welcome.page_title',
    loadComponent: () => import('./presentation/views/welcome/welcome').then((m) => m.Welcome),
  },
  {
    path: iamPaths.signIn,
    title: 'iam.sign_in.page_title',
    loadComponent: () => import('./presentation/views/sign-in/sign-in').then((m) => m.SignIn),
  },
  {
    path: iamPaths.signUp,
    title: 'iam.sign_up.page_title',
    loadComponent: () => import('./presentation/views/sign-up/sign-up').then((m) => m.SignUp),
  },
  {
    path: iamPaths.forgotPassword,
    title: 'iam.forgot_password.page_title',
    loadComponent: () =>
      import('./presentation/views/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: iamPaths.resetPassword,
    title: 'iam.reset_password.page_title',
    canActivate: [passwordRecoveryGuard],
    loadComponent: () =>
      import('./presentation/views/reset-password/reset-password').then((m) => m.ResetPassword),
  },
];
