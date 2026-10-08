/**
 * Application-level destinations that do not belong to a single bounded context.
 * Bounded contexts navigate across each other through these entries, never by importing
 * another context's routes.
 */
export const appNav = {
  /** Landing page after signing in or signing up. When Property Management implements gallery
   *  registration, sign-up should continue there (mock-up 03b). */
  dashboard: ['/dashboard'],
  /** Profile of the signed-in user (Profiles and Preferences), opened from the account menu. */
  profile: ['/profile'],
  termsAndConditions: ['/terms-and-conditions'],
} as const;
