import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { CommunicationLogsStore } from '../../../application/communication-logs.store';
import { ReferenceType } from '../../../domain/model/reference-type.enum';
import { CommunicationTabs } from '../../components/communication-tabs/communication-tabs';

/**
 * Communication logs (GetLogsByTenantQuery): every conversation and notification with a tenant,
 * filtered by tenant, kind and date range, for traceability.
 */
@Component({
  selector: 'app-communication-logs',
  imports: [
    CommunicationTabs,
    FormsModule,
    LocalizedDatePipe,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    TranslatePipe,
  ],
  templateUrl: './communication-logs.html',
  styleUrl: '../../styles/communication.css',
})
export class CommunicationLogs {
  protected readonly store = inject(CommunicationLogsStore);

  protected readonly referenceTypes = Object.values(ReferenceType);
  protected readonly tenantId = signal<string>('ALL');
  protected readonly referenceType = signal<ReferenceType | 'ALL'>('ALL');
  /** `yyyy-MM-dd` values of the date inputs; empty means no limit. */
  protected readonly from = signal('');
  protected readonly to = signal('');
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = 10;

  protected readonly filtered = computed(() => {
    const from = this.from() ? new Date(`${this.from()}T00:00:00`) : null;
    const to = this.to() ? new Date(`${this.to()}T23:59:59.999`) : null;
    return this.store
      .logs()
      .filter(
        (log) =>
          (this.tenantId() === 'ALL' || log.tenantId === this.tenantId()) &&
          (this.referenceType() === 'ALL' || log.referenceType === this.referenceType()) &&
          (!from || log.loggedAt >= from) &&
          (!to || log.loggedAt <= to),
      );
  });
  protected readonly page = computed(() =>
    this.filtered().slice(this.pageIndex() * this.pageSize, (this.pageIndex() + 1) * this.pageSize),
  );
  protected readonly hasFilters = computed(
    () =>
      this.tenantId() !== 'ALL' || this.referenceType() !== 'ALL' || !!this.from() || !!this.to(),
  );

  constructor() {
    void this.store.load();
  }

  protected setFilter(filter: 'tenantId' | 'referenceType' | 'from' | 'to', value: string): void {
    if (filter === 'referenceType') this.referenceType.set(value as ReferenceType | 'ALL');
    else this[filter].set(value);
    this.pageIndex.set(0);
  }

  protected clearFilters(): void {
    this.tenantId.set('ALL');
    this.referenceType.set('ALL');
    this.from.set('');
    this.to.set('');
    this.pageIndex.set(0);
  }

  protected changePage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
  }
}
