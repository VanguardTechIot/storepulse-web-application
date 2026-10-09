export const iamPaths = {
  welcome: 'welcome',
  signIn: 'sign-in',
  signUp: 'sign-up',
  forgotPassword: 'forgot-password',
  resetPassword: 'reset-password',
} as const;

export const iamNav = {
  welcome: () => ['/iam', iamPaths.welcome],
  signIn: () => ['/iam', iamPaths.signIn],
  signUp: () => ['/iam', iamPaths.signUp],
  forgotPassword: () => ['/iam', iamPaths.forgotPassword],
  resetPassword: () => ['/iam', iamPaths.resetPassword],
} as const;
