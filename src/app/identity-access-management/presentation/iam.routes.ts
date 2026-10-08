import { Routes } from '@angular/router';
import { passwordRecoveryGuard } from './iam.guards';
import { iamPaths } from './iam.nav';

const welcome = () => import('./views/welcome/welcome').then((m) => m.Welcome);
const signIn = () => import('./views/sign-in/sign-in').then((m) => m.SignIn);
const signUp = () => import('./views/sign-up/sign-up').then((m) => m.SignUp);
const forgotPassword = () =>
  import('./views/forgot-password/forgot-password').then((m) => m.ForgotPassword);
const resetPassword = () =>
  import('./views/reset-password/reset-password').then((m) => m.ResetPassword);

/** Route titles are i18n keys, translated by `TranslatedTitleStrategy`. */
export const iamRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: iamPaths.welcome },
  { path: iamPaths.welcome, loadComponent: welcome, title: 'iam.welcome.page-title' },
  { path: iamPaths.signIn, loadComponent: signIn, title: 'iam.sign-in.page-title' },
  { path: iamPaths.signUp, loadComponent: signUp, title: 'iam.sign-up.page-title' },
  {
    path: iamPaths.forgotPassword,
    loadComponent: forgotPassword,
    title: 'iam.forgot-password.page-title',
  },
  {
    path: iamPaths.resetPassword,
    loadComponent: resetPassword,
    canActivate: [passwordRecoveryGuard],
    title: 'iam.reset-password.page-title',
  },
];
