/**
 * Application-level destinations that do not belong to a single bounded context.
 * Bounded contexts navigate across each other through these entries, never by importing
 * another context's routes.
 */
export const appNav = {
  /** Landing page after signing in or signing up. When Property Management implements gallery
   *  registration, sign-up should continue there (mock-up 03b). */
  dashboard: ['/dashboard'],
  termsAndConditions: ['/terms-and-conditions'],
} as const;
