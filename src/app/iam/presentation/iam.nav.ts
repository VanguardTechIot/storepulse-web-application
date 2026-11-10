/** URL path segments used by the IAM feature routes. */
export const iamPaths = {
  welcome: 'welcome',
  signIn: 'sign-in',
  signUp: 'sign-up',
  forgotPassword: 'forgot-password',
  resetPassword: 'reset-password',
} as const;

/** Router link commands for navigating to IAM feature pages. */
export const iamNav = {
  /** Creates router commands for the welcome page. */
  welcome: () => ['/iam', iamPaths.welcome],
  /** Creates router commands for the sign-in page. */
  signIn: () => ['/iam', iamPaths.signIn],
  /** Creates router commands for the registration page. */
  signUp: () => ['/iam', iamPaths.signUp],
  /** Creates router commands for the password recovery request page. */
  forgotPassword: () => ['/iam', iamPaths.forgotPassword],
  /** Creates router commands for the password reset page. */
  resetPassword: () => ['/iam', iamPaths.resetPassword],
} as const;
