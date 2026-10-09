import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../../../shared/infrastructure/i18n/translation.service';
import { Callout } from '../../../../shared/presentation/components/callout/callout';
import { confirmAction } from '../../../../shared/presentation/components/confirmation-dialog/confirmation-dialog';
import { ToastService } from '../../../../shared/presentation/components/toast-host/toast.service';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { PropertyManagementStore } from '../../../application/property-management.store';
import { InvitationStatus } from '../../../domain/model/invitation-status.enum';
import { TenantInvitation } from '../../../domain/model/tenant-invitation.entity';
import { InvitationStatusBadge } from '../../components/invitation-status-badge/invitation-status-badge';
import { PropertyTabs } from '../../components/property-tabs/property-tabs';

type InvitationFilter = 'ALL' | InvitationStatus;

/**
 * Tenant invitations of the gallery (US-12, TS-10): who was invited to which store, until when
 * the link is valid, and sending it again when it expired (scenario 3).
 */
@Component({
  selector: 'app-lease-management',
  imports: [
    Callout,
    InvitationStatusBadge,
    LocalizedDatePipe,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    PropertyTabs,
    RouterLink,
    TranslatePipe,
  ],
  templateUrl: './lease-management.html',
  styleUrl: '../../styles/property.css',
})
export class LeaseManagement {
  protected readonly store = inject(PropertyManagementStore);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslationService);

  protected readonly filters: InvitationFilter[] = [
    'ALL',
    InvitationStatus.Pending,
    InvitationStatus.Expired,
    InvitationStatus.Revoked,
  ];
  protected readonly filter = signal<InvitationFilter>('ALL');
  protected readonly visible = computed(() => {
    const filter = this.filter();
    const now = new Date();
    return this.store
      .sortedInvitations()
      .filter((invitation) => filter === 'ALL' || invitation.statusAt(now) === filter);
  });

  constructor() {
    void this.store.load();
  }

  protected unitCode(invitation: TenantInvitation): string {
    return this.store.unitById(invitation.unitId)?.code ?? '—';
  }

  protected async resend(invitation: TenantInvitation): Promise<void> {
    const confirmed = await confirmAction(this.dialog, {
      title: this.i18n.t('property.invitations.resend_title', { email: invitation.email }),
      message: this.i18n.t('property.invitations.resend_message'),
      confirmLabel: this.i18n.t('property.invitations.resend'),
      icon: 'forward_to_inbox',
    });
    if (!confirmed) return;
    if (await this.store.resendInvitation(invitation.id)) {
      this.toast.show(
        'success',
        this.i18n.t('property.invite.sent', { unit: this.unitCode(invitation) }),
      );
    } else {
      this.reportError();
    }
  }

  protected async revoke(invitation: TenantInvitation): Promise<void> {
    const confirmed = await confirmAction(this.dialog, {
      title: this.i18n.t('property.invitations.revoke_title', { email: invitation.email }),
      message: this.i18n.t('property.invitations.revoke_message'),
      confirmLabel: this.i18n.t('property.invitations.revoke'),
      tone: 'danger',
      icon: 'link_off',
    });
    if (!confirmed) return;
    if (await this.store.revokeInvitation(invitation.id)) {
      this.toast.show('success', this.i18n.t('property.invitations.revoked'));
    } else {
      this.reportError();
    }
  }

  private reportError(): void {
    const error = this.store.error();
    if (error) this.toast.show('error', this.i18n.t(`property.errors.${error}`));
    this.store.clearError();
  }
}
