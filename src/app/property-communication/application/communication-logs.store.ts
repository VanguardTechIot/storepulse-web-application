import { computed, inject, Injectable, signal } from '@angular/core';
import { CommunicationErrorCode } from '../domain/model/communication-error';
import { CommunicationLog } from '../domain/model/communication-log.entity';
import { PROPERTY_COMMUNICATION_REPOSITORY } from '../infrastructure/property-communication.token';
import { CommunicationDirectory } from './communication-directory';
import { runOperation } from './run-operation';

/** Application service of the communication logs, kept for traceability and audit. */
@Injectable({ providedIn: 'root' })
export class CommunicationLogsStore {
  private readonly repository = inject(PROPERTY_COMMUNICATION_REPOSITORY);
  readonly directory = inject(CommunicationDirectory);

  private readonly logsState = signal<CommunicationLog[]>([]);

  readonly loading = signal(false);
  readonly error = signal<CommunicationErrorCode | null>(null);

  /** Newest first (GetLogsByTenantQuery, for every tenant of the gallery). */
  readonly logs = computed(() =>
    [...this.logsState()].sort((a, b) => b.loggedAt.getTime() - a.loggedAt.getTime()),
  );

  load(): Promise<boolean> {
    return runOperation(this.loading, this.error, async () => {
      const administratorId = await this.directory.load();
      this.logsState.set(await this.repository.listLogs(administratorId));
    });
  }
}
