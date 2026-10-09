import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { InvitationStatus } from '../../../domain/model/invitation-status.enum';
import { TenantInvitation } from '../../../domain/model/tenant-invitation.entity';

const tones: Record<InvitationStatus, string> = {
  [InvitationStatus.Pending]: 'badge--warning',
  [InvitationStatus.Accepted]: 'badge--success',
  [InvitationStatus.Revoked]: 'badge--neutral',
  [InvitationStatus.Expired]: 'badge--danger',
};

/** Status of a tenant invitation, expired once its 7 days pass (US-12). */
@Component({
  selector: 'app-invitation-status-badge',
  imports: [TranslatePipe],
  template: `<span [class]="'badge ' + tone()">{{
    'property.invitation_status.' + status() | translate
  }}</span>`,
})
export class InvitationStatusBadge {
  readonly invitation = input.required<TenantInvitation>();

  protected readonly status = computed(() => this.invitation().statusAt());
  protected readonly tone = computed(() => tones[this.status()]);
}
