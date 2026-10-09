export const environment = {
  production: true,
  // Replace with the deployed StorePulse REST API URL when it is available.
  platformProviderApiBaseUrl: 'https://storepulse-web-application.onrender.com/api/v1',

  // Profiles and Preferences: the profile is read and updated at /users/{userId}/profile (TS-04).
  platformProviderUserProfileEndpointPath: '/users/{userId}/profile',
  // Local JSON API only: sign-up creates the profile here; the REST API does it on its own.
  platformProviderProfilesEndpointPath: '/profiles',

  // Identity and Access Management
  platformProviderUsersEndpointPath: '/users',
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
};
