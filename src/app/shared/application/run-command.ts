import { WritableSignal } from '@angular/core';

/**
 * Runs a store command: raises `busy` while it runs, clears the previous error and records the
 * error code it fails with. Resolves to the command result, or to `null` when it fails.
 */
export async function runCommand<T, Code>(
  busy: WritableSignal<boolean>,
  error: WritableSignal<Code | null>,
  toCode: (failure: unknown) => Code,
  command: () => Promise<T>,
): Promise<T | null> {
  busy.set(true);
  error.set(null);
  try {
    return await command();
  } catch (failure) {
    error.set(toCode(failure));
    return null;
  } finally {
    busy.set(false);
  }
}
