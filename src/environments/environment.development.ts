export const environment = {
  production: false,
  // Local JSON API (json-server). Start it with `npm run mock:api`.
  platformProviderApiBaseUrl: 'http://localhost:3000/api/v1',

  // Identity and Access Management
  platformProviderUsersEndpointPath: '/users',
  platformProviderPasswordRecoveriesEndpointPath: '/password-recoveries',
};
