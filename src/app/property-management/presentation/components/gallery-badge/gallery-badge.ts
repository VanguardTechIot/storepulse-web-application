import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { appNav } from '../../../../shared/routing/app-nav';
import { PropertyManagementStore } from '../../../application/property-management.store';

/** Gallery of the signed-in administrator, shown in the top bar; it opens the gallery data. */
@Component({
  selector: 'app-gallery-badge',
  imports: [MatIconModule, RouterLink, TranslatePipe],
  templateUrl: './gallery-badge.html',
  styleUrl: './gallery-badge.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryBadge {
  private readonly store = inject(PropertyManagementStore);

  protected readonly gallery = this.store.gallery;
  protected readonly galleryRoute = appNav.galleryRegistration;

  constructor() {
    if (!this.store.loaded()) void this.store.load();
  }
}
