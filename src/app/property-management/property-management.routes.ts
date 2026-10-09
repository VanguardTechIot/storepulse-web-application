import { Routes } from '@angular/router';

/** Route titles are i18n keys, translated by `TranslatedTitleStrategy`. */
export const PROPERTY_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    title: 'property.units.page_title',
    loadComponent: () => import('./presentation/views/unit-list/unit-list').then((m) => m.UnitList),
  },
  {
    path: 'floors',
    title: 'property.floors.page_title',
    loadComponent: () =>
      import('./presentation/views/floor-layout/floor-layout').then((m) => m.FloorLayout),
  },
  {
    path: 'invitations',
    title: 'property.invitations.page_title',
    loadComponent: () =>
      import('./presentation/views/lease-management/lease-management').then(
        (m) => m.LeaseManagement,
      ),
  },
  {
    path: 'gallery',
    title: 'property.gallery.page_title',
    loadComponent: () =>
      import('./presentation/views/gallery-detail/gallery-detail').then((m) => m.GalleryDetail),
  },
  {
    path: ':unitId',
    title: 'property.unit_detail.page_title',
    loadComponent: () =>
      import('./presentation/views/unit-detail/unit-detail').then((m) => m.UnitDetail),
  },
];
