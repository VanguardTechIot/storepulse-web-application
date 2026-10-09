import { WritableSignal } from '@angular/core';
import { CommunicationError, CommunicationErrorCode } from '../domain/model/communication-error';

/**
 * Runs a use case of Property Communication with its busy flag. Resolves to `true` when it
 * succeeds; on failure resolves to `false` and leaves the reason in `error` (a
 * `CommunicationErrorCode`, translated as `communication.errors.<code>`).
 */
export async function runOperation(
  busy: WritableSignal<boolean>,
  error: WritableSignal<CommunicationErrorCode | null>,
  operation: () => Promise<void>,
): Promise<boolean> {
  busy.set(true);
  error.set(null);
  try {
    await operation();
    return true;
  } catch (failure) {
    if (!(failure instanceof CommunicationError)) console.error('[Communication]', failure);
    error.set(
      failure instanceof CommunicationError ? failure.code : CommunicationErrorCode.Unexpected,
    );
    return false;
  } finally {
    busy.set(false);
  }
}
