import { Routes } from '@angular/router';
import { ComingSoon } from '../shared/presentation/views/coming-soon/coming-soon';

/**
 * Route titles are i18n keys, translated by `TranslatedTitleStrategy`.
 * Placeholder until the profile view (mock-up 12, US-06 and US-07) is implemented.
 */
export const PROFILES_PREFERENCES_ROUTES: Routes = [
  {
    path: '',
    title: 'profiles.profile.page_title',
    component: ComingSoon,
    data: { titleKey: 'profiles.profile.page_title' },
  },
];
