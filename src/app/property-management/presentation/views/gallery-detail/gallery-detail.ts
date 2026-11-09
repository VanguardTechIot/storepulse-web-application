import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { TranslationService } from '../../../../shared/infrastructure/i18n/translation.service';
import { ToastService } from '../../../../shared/presentation/components/toast-host/toast.service';
import { LocalizedDatePipe } from '../../../../shared/presentation/pipes/localized-date.pipe';
import { PageState } from '../../../../shared/presentation/components/page-state/page-state';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { PropertyManagementStore } from '../../../application/property-management.store';
import { GalleryForm } from '../../components/gallery-form/gallery-form';
import { SectionTabs } from '../../../../shared/presentation/components/section-tabs/section-tabs';
import { propertyTabs } from '../../property.tabs';

/** Gallery data: registration or edition of its name, address and number of units. */
@Component({
  selector: 'app-gallery-detail',
  imports: [GalleryForm, LocalizedDatePipe, MatCardModule, PageState, SectionTabs, TranslatePipe],
  templateUrl: './gallery-detail.html',
  styleUrl: '../../styles/property.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryDetail {
  protected readonly tabs = propertyTabs;
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
