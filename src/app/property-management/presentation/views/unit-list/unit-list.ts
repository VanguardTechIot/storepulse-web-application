import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { LocalizedNumberPipe } from '../../../../shared/presentation/pipes/localized-number.pipe';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { PropertyManagementStore } from '../../../application/property-management.store';
import { InvitationStatus } from '../../../domain/model/invitation-status.enum';
import { TenantInvitation } from '../../../domain/model/tenant-invitation.entity';
import { UnitStatus } from '../../../domain/model/unit-status.enum';
import { UnitType } from '../../../domain/model/unit-type.enum';
import { GalleryForm } from '../../components/gallery-form/gallery-form';
import { PropertyTabs } from '../../components/property-tabs/property-tabs';
import { UnitStatusBadge } from '../../components/unit-status-badge/unit-status-badge';
import { UnitActions } from '../../unit-actions';

type UnitFilter = 'ALL' | UnitStatus | 'COMMON_AREA';

const FILTERS: readonly UnitFilter[] = [
  'ALL',
  UnitStatus.Available,
  UnitStatus.Occupied,
  UnitStatus.Maintenance,
  'COMMON_AREA',
];

/**
 * Commercial Units (US-13): summary of the gallery and its stores and common areas, with their
 * status and tenant. Without a gallery it asks to register it first (US-08).
 */
@Component({
  selector: 'app-unit-list',
  imports: [
    FormsModule,
    GalleryForm,
    LocalizedDatePipe,
    LocalizedNumberPipe,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule,
    PropertyTabs,
    RouterLink,
    TranslatePipe,
    UnitStatusBadge,
  ],
  templateUrl: './unit-list.html',
  styleUrl: '../../styles/property.css',
})
export class UnitList {
  protected readonly store = inject(PropertyManagementStore);
  protected readonly actions = inject(UnitActions);

  protected readonly UnitType = UnitType;
  protected readonly filters = FILTERS;
  protected readonly search = signal('');
  protected readonly filter = signal<UnitFilter>('ALL');

  /** Search by unit number, common area name, business or tenant (mock-up search field). */
  protected readonly visibleUnits = computed(() => {
    const term = this.search().trim().toLocaleLowerCase();
    const filter = this.filter();
    return this.store.units().filter((unit) => {
      const matchesFilter =
        filter === 'ALL' ||
        (filter === 'COMMON_AREA' ? unit.isCommonArea : unit.isStore && unit.status === filter);
      if (!matchesFilter) return false;
      if (!term) return true;
      const tenant = this.store.tenantOf(unit.id)?.fullName ?? '';
      return [unit.code, unit.businessName ?? '', tenant].some((text) =>
        text.toLocaleLowerCase().includes(term),
      );
    });
  });

  constructor() {
    void this.store.load();
  }

  protected isExpired(invitation: TenantInvitation): boolean {
    return invitation.statusAt() === InvitationStatus.Expired;
  }

  protected clearFilters(): void {
    this.search.set('');
    this.filter.set('ALL');
  }
}
