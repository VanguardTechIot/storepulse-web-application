import { SectionTab } from '../../shared/presentation/components/section-tabs/section-tabs';

/** Sections of Communication. */
export const communicationTabs: SectionTab[] = [
  {
    path: '/communication/conversations',
    label: 'communication.tabs.conversations',
    icon: 'forum',
  },
  {
    path: '/communication/notifications',
    label: 'communication.tabs.notifications',
    icon: 'campaign',
  },
  {
    path: '/communication/assignments',
    label: 'communication.tabs.assignments',
    icon: 'assignment_ind',
  },
  { path: '/communication/logs', label: 'communication.tabs.logs', icon: 'history' },
];
