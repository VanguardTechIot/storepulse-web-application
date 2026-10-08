/** Convierte un error del store en una clave de traducción visible para el usuario. */
export function errorKeyOf(error: unknown): string {
  if (error instanceof Error && error.message.startsWith('billing.errors.')) {
    return error.message;
  }
  return 'billing.errors.generic';
}
