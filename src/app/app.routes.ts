import { Routes } from '@angular/router';
import {
  authenticationGuard,
  guestGuard,
} from './identity-access-management/presentation/iam.guards';
const mainLayout = () =>
  import('./shared/presentation/views/main-layout/main-layout').then((m) => m.MainLayout);
const iamRoutes = () =>
  import('./identity-access-management/presentation/iam.routes').then((m) => m.iamRoutes);
const home = () => import('./shared/presentation/views/home/home').then((m) => m.Home);
const pageNotFound = () =>
  import('./shared/presentation/views/page-not-found/page-not-found').then((m) => m.PageNotFound);

/** Route titles are i18n keys, translated by `TranslatedTitleStrategy`. */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'iam' },
  { path: 'iam', canActivate: [guestGuard], loadChildren: iamRoutes },
  {
    path: '',
    loadComponent: mainLayout,
    canActivate: [authenticationGuard],
    children: [{ path: 'home', loadComponent: home, title: 'shared.home.page-title' }],
  },
  { path: '**', loadComponent: pageNotFound, title: 'shared.not-found.page-title' },
];
