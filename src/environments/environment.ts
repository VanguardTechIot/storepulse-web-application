export const environment = {
  production: true,
  // StorePulse REST API deployed on Render.
  platformProviderApiBaseUrl: 'https://storepulse-web-application.onrender.com/api/v1',

  // Profiles and Preferences: the profile is read and updated at /users/{userId}/profile.
  platformProviderUserProfileEndpointPath: '/users/{userId}/profile',

  // Identity and Access Management: sign-in and sign-up answer the account and its JWT.
  platformProviderAuthenticationEndpointPath: '/authentication',
  platformProviderPasswordRecoveriesEndpointPath: '/password-recoveries',

  // Property Management: galleries, their units (stores and common areas) and tenant invitations.
  platformProviderGalleriesEndpointPath: '/galleries',
  platformProviderGalleryUnitsEndpointPath: '/galleries/{galleryId}/units',
  platformProviderUnitsEndpointPath: '/units',
  platformProviderUnitInviteEndpointPath: '/units/{unitId}/invite',
  platformProviderTenantInvitationsEndpointPath: '/tenant-invitations',

  // Property Communication
  platformProviderConversationsEndpointPath: '/conversations',
  platformProviderTenantNotificationsEndpointPath: '/tenant-notifications',
  platformProviderCommunicationLogsEndpointPath: '/communication-logs',
  platformProviderTenantAssignmentsEndpointPath: '/tenant-assignments',

  // Resource and Asset Management: stands and common areas, and the IoT devices installed in them.
  platformProviderResourcesEndpointPath: '/resources',
  platformProviderIoTDevicesEndpointPath: '/iot-devices',

  platformProviderTelemetryEndpointPath: '/telemetry',
  platformProviderAlertsEndpointPath: '/alerts',
  platformProviderConsumptionEndpointPath: '/consumption',

  // Dashboard and Analytics: consolidated summary; the alerts it attends come from Safety.
  platformProviderDashboardSummaryEndpointPath: '/dashboard/summary',

  // Subscriptions and Payments: plan catalog and gallery subscription, with its payments nested.
  platformProviderSubscriptionPlansEndpointPath: '/subscription-plans',
  platformProviderSubscriptionsEndpointPath: '/subscriptions',

  // Utility Billing: bills of the units, with their breakdown, and the disputes over them.
  platformProviderUtilityBillsEndpointPath: '/utility-bills',
  platformProviderBillingDisputesEndpointPath: '/billing-disputes',
};
