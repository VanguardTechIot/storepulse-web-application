import { SectionTab } from '../../shared/presentation/components/section-tabs/section-tabs';

/** Sections of Commercial Units. */
export const propertyTabs: SectionTab[] = [
  { path: '/commercial-units', label: 'property.tabs.units', icon: 'storefront', exact: true },
  { path: '/commercial-units/floors', label: 'property.tabs.floors', icon: 'layers' },
  {
    path: '/commercial-units/invitations',
    label: 'property.tabs.invitations',
    icon: 'forward_to_inbox',
  },
  { path: '/commercial-units/gallery', label: 'property.tabs.gallery', icon: 'apartment' },
];
