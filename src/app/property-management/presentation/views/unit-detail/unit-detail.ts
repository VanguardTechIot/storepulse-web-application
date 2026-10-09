import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { LocalizedNumberPipe } from '../../../../shared/presentation/pipes/localized-number.pipe';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { PropertyManagementStore } from '../../../application/property-management.store';
import { InvitationStatusBadge } from '../../components/invitation-status-badge/invitation-status-badge';
import { UnitStatusBadge } from '../../components/unit-status-badge/unit-status-badge';
import { UnitActions } from '../../unit-actions';

/**
 * Detail of a store or common area: its data, its tenant or the invitations sent for it, and the
 * IoT devices installed in it.
 */
@Component({
  selector: 'app-unit-detail',
  imports: [
    InvitationStatusBadge,
    LocalizedDatePipe,
    LocalizedNumberPipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink,
    TranslatePipe,
    UnitStatusBadge,
  ],
  templateUrl: './unit-detail.html',
  styleUrl: '../../styles/property.css',
})
export class UnitDetail {
  protected readonly store = inject(PropertyManagementStore);
  protected readonly actions = inject(UnitActions);
  private readonly router = inject(Router);

  private readonly unitId = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('unitId') ?? '')),
    { initialValue: '' },
  );
  protected readonly unit = computed(() => this.store.unitById(this.unitId()));
  protected readonly tenant = computed(() => {
    const unit = this.unit();
    return unit ? this.store.tenantOf(unit.id) : null;
  });
  protected readonly invitations = computed(() => {
    const unit = this.unit();
    return unit ? this.store.invitationsOf(unit.id) : [];
  });
  protected readonly devices = signal<string[] | null>(null);

  constructor() {
    void this.store.load();
    effect(() => {
      const unit = this.unit();
      if (!unit) return;
      this.devices.set(null);
      this.store
        .linkedDevicesOf(unit.id)
        .then((serials) => this.devices.set(serials))
        .catch(() => this.devices.set([]));
    });
  }

  protected async remove(): Promise<void> {
    const unit = this.unit();
    if (unit && (await this.actions.remove(unit))) {
      await this.router.navigate(['/commercial-units']);
    }
  }
}
