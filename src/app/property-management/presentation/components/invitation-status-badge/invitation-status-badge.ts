import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { StatusChip } from '../../../../shared/presentation/components/status-chip/status-chip';
import { Tone } from '../../../../shared/presentation/components/tone-icon/tone-icon';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { InvitationStatus } from '../../../domain/model/invitation-status.enum';
import { TenantInvitation } from '../../../domain/model/tenant-invitation.entity';

const tones: Record<InvitationStatus, Tone> = {
  [InvitationStatus.Pending]: 'warning',
  [InvitationStatus.Accepted]: 'success',
  [InvitationStatus.Revoked]: 'neutral',
  [InvitationStatus.Expired]: 'danger',
};

/** Status of a tenant invitation, expired once its 7 days pass. */
@Component({
  selector: 'app-invitation-status-badge',
  imports: [StatusChip, TranslatePipe],
  templateUrl: './invitation-status-badge.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvitationStatusBadge {
  readonly invitation = input.required<TenantInvitation>();

  protected readonly status = computed(() => this.invitation().statusAt());
  protected readonly tone = computed(() => tones[this.status()]);
}
