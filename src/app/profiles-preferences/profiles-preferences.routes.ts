import { Routes } from '@angular/router';

/** Route titles are i18n keys, translated by `TranslatedTitleStrategy`. */
export const PROFILES_PREFERENCES_ROUTES: Routes = [
  {
    path: '',
    title: 'profiles.profile.page_title',
    loadComponent: () =>
      import('./presentation/views/profile-settings/profile-settings').then(
        (m) => m.ProfileSettings,
      ),
  },
];
