/**
 * Application-level destinations that do not belong to a single bounded context.
 * Bounded contexts navigate across each other through these entries, never by importing
 * another context's routes.
 */
export const appNav = {
  /** Landing page after signing in or signing up. Replace with the consolidated dashboard once
   *  Dashboard and Analytics is implemented (and with gallery registration for sign-up once
   *  Property Management is implemented). */
  home: ['/home'],
  termsAndConditions: ['/terms-and-conditions'],
} as const;
