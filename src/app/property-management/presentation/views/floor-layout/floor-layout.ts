import { Component, computed, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { PropertyManagementStore } from '../../../application/property-management.store';
import { CommercialUnit } from '../../../domain/model/commercial-unit.entity';
import { PropertyTabs } from '../../components/property-tabs/property-tabs';

interface FloorRow {
  floor: string;
  units: CommercialUnit[];
  occupied: number;
}

/** Floor layout: the units of each floor colored by status, to read occupancy at a glance. */
@Component({
  selector: 'app-floor-layout',
  imports: [
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PropertyTabs,
    RouterLink,
    TranslatePipe,
  ],
  templateUrl: './floor-layout.html',
  styleUrl: '../../styles/property.css',
})
export class FloorLayout {
  protected readonly store = inject(PropertyManagementStore);

  protected readonly rows = computed<FloorRow[]>(() =>
    this.store.floors().map((floor) => {
      const units = this.store.units().filter((unit) => unit.floor === floor);
      return { floor, units, occupied: units.filter((unit) => unit.isOccupied).length };
    }),
  );

  constructor() {
    void this.store.load();
  }

  protected tileClass(unit: CommercialUnit): string {
    if (unit.isCommonArea) return 'tile common';
    return `tile ${unit.status.toLowerCase()}`;
  }
}
