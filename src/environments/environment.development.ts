export const environment = {
  production: false,
  // Local JSON API (json-server). Start it with `npm run mock:api`.
  platformProviderApiBaseUrl: 'http://localhost:3000/api/v1',

  // Profiles and Preferences: the profile is read and updated at /users/{userId}/profile (TS-04).
  platformProviderUserProfileEndpointPath: '/users/{userId}/profile',
  // Local JSON API only: sign-up creates the profile here; the REST API does it on its own.
  platformProviderProfilesEndpointPath: '/profiles',

  // Identity and Access Management
  platformProviderUsersEndpointPath: '/users',
  platformProviderPasswordRecoveriesEndpointPath: '/password-recoveries',
};
