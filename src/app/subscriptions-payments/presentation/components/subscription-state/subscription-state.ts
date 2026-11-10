import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { PageState } from '../../../../shared/presentation/components/page-state/page-state';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { SubscriptionsStore } from '../../../application/subscriptions.store';
import { SubscriptionsErrorCode } from '../../../domain/model/subscriptions-error';

/**
 * Loading and error placeholder of the subscription views. Without a registered gallery it links
 * to the gallery registration instead of offering a retry.
 */
@Component({
  selector: 'app-subscription-state',
  imports: [MatButtonModule, MatCardModule, RouterLink, PageState, TranslatePipe],
  templateUrl: './subscription-state.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionState {
  protected readonly store = inject(SubscriptionsStore);
  protected readonly noGallery = SubscriptionsErrorCode.GalleryNotRegistered;
}
