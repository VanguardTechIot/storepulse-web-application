import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslationService } from '../../../../shared/infrastructure/i18n/translation.service';
import { ToastService } from '../../../../shared/presentation/components/toast-host/toast.service';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { PropertyManagementStore } from '../../../application/property-management.store';
import { GalleryForm } from '../../components/gallery-form/gallery-form';
import { PropertyTabs } from '../../components/property-tabs/property-tabs';

/** Gallery data: registration (US-08) or edition of its name, address and number of units. */
@Component({
  selector: 'app-gallery-detail',
  imports: [
    GalleryForm,
    LocalizedDatePipe,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PropertyTabs,
    TranslatePipe,
  ],
  template: `
    <header class="page-head">
      <div>
        <h1>{{ 'property.gallery.page_title' | translate }}</h1>
        <p>
          @if (store.gallery(); as gallery) {
            {{
              'property.gallery.registered_on'
                | translate: { date: (gallery.registeredAt | localizedDate: 'date') }
            }}
          } @else {
            {{ 'property.gallery.register_subtitle' | translate }}
          }
        </p>
      </div>
    </header>

    @if (store.gallery()) {
      <app-property-tabs />
    }

    @if (store.loading() && !store.loaded()) {
      <div class="state" role="status">
        <mat-spinner diameter="32" aria-hidden="true" />
        <span>{{ 'common.states.loading' | translate }}</span>
      </div>
    } @else {
      <app-gallery-form [gallery]="store.gallery()" (saved)="saved()" />
    }
  `,
  styleUrl: '../../styles/property.css',
})
export class GalleryDetail {
  protected readonly store = inject(PropertyManagementStore);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslationService);

  constructor() {
    void this.store.load();
  }

  protected saved(): void {
    this.toast.show('success', this.i18n.t('property.gallery.saved'));
  }
}
