import { Routes } from '@angular/router';

/** Route titles are i18n keys, translated by `TranslatedTitleStrategy`. */
export const PROPERTY_COMMUNICATION_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'conversations' },
  {
    path: 'conversations',
    title: 'communication.conversations.page_title',
    loadComponent: () =>
      import('./presentation/views/conversation-list/conversation-list').then(
        (m) => m.ConversationList,
      ),
  },
  {
    path: 'conversations/:conversationId',
    title: 'communication.conversation.page_title',
    loadComponent: () =>
      import('./presentation/views/conversation-detail/conversation-detail').then(
        (m) => m.ConversationDetail,
      ),
  },
  {
    path: 'notifications',
    title: 'communication.notifications.page_title',
    loadComponent: () =>
      import('./presentation/views/tenant-notifications/tenant-notifications').then(
        (m) => m.TenantNotifications,
      ),
  },
  {
    path: 'logs',
    title: 'communication.logs.page_title',
    loadComponent: () =>
      import('./presentation/views/communication-logs/communication-logs').then(
        (m) => m.CommunicationLogs,
      ),
  },
  {
    path: 'assignments',
    title: 'communication.assignments.page_title',
    loadComponent: () =>
      import('./presentation/views/tenant-assignments/tenant-assignments').then(
        (m) => m.TenantAssignments,
      ),
  },
];
