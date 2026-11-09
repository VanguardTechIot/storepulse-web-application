import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';
import { TranslationService } from '../../../../shared/infrastructure/i18n/translation.service';
import { confirmAction } from '../../../../shared/presentation/components/confirmation-dialog/confirmation-dialog';
import { ToastService } from '../../../../shared/presentation/components/toast-host/toast.service';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { PageState } from '../../../../shared/presentation/components/page-state/page-state';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { TenantAssignmentsStore } from '../../../application/tenant-assignments.store';
import { AssignmentStatus } from '../../../domain/model/assignment-status.enum';
import { TenantAssignment } from '../../../domain/model/tenant-assignment.entity';
import { AssignTenantDialog } from '../../components/assign-tenant-dialog/assign-tenant-dialog';
import { CommunicationStatusBadge } from '../../components/status-badge/status-badge';
import { SectionTabs } from '../../../../shared/presentation/components/section-tabs/section-tabs';
import { communicationTabs } from '../../communication.tabs';

type AssignmentFilter = 'ALL' | AssignmentStatus;

/** Assignments of registered tenants to stores: who occupies each store and since when. */
@Component({
  selector: 'app-tenant-assignments',
  imports: [
    CommunicationStatusBadge,
    LocalizedDatePipe,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    PageState,
    SectionTabs,
    TranslatePipe,
  ],
  templateUrl: './tenant-assignments.html',
  styleUrl: '../../styles/communication.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantAssignments {
  protected readonly tabs = communicationTabs;
  protected readonly columns = [
    'tenant',
    'unit',
    'assignedAt',
    'terminatedAt',
    'status',
    'actions',
  ];
  protected readonly store = inject(TenantAssignmentsStore);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslationService);

  protected readonly filters: AssignmentFilter[] = [
    'ALL',
    AssignmentStatus.Active,
    AssignmentStatus.Terminated,
  ];
  protected readonly filter = signal<AssignmentFilter>(AssignmentStatus.Active);
  protected readonly visible = computed(() =>
    this.store.assignments().filter((a) => this.filter() === 'ALL' || a.status === this.filter()),
  );

  constructor() {
    void this.store.load();
  }

  protected async assign(): Promise<void> {
    const ref = this.dialog.open<AssignTenantDialog, void, boolean>(AssignTenantDialog, {
      width: '560px',
    });
    if (await firstValueFrom(ref.afterClosed())) {
      this.toast.show('success', this.i18n.t('communication.assign.done'));
    }
  }

  protected async terminate(assignment: TenantAssignment): Promise<void> {
    const confirmed = await confirmAction(this.dialog, {
      title: this.i18n.t('communication.assignments.terminate_title', {
        tenant: this.store.directory.tenantName(assignment.tenantId),
      }),
      message: this.i18n.t('communication.assignments.terminate_message', {
        unit: this.store.directory.unitLabel(assignment.commercialUnitId),
      }),
      confirmLabel: this.i18n.t('communication.assignments.terminate'),
      tone: 'danger',
      icon: 'person_remove',
    });
    if (!confirmed) return;
    if (await this.store.terminate(assignment.id)) {
      this.toast.show('success', this.i18n.t('communication.assignments.terminated'));
    } else if (this.store.error()) {
      this.toast.show('error', this.i18n.t(`communication.errors.${this.store.error()}`));
      this.store.clearError();
    }
  }
}
