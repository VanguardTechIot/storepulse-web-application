import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { SubscriptionsStore } from '../../../application/subscriptions.store';
import { SubscriptionsErrorCode } from '../../../domain/model/subscriptions-error';

/**
 * Loading and error placeholder shown by every Subscription view until the data is available.
 * Without a registered gallery it links to the gallery registration (Property Management).
 */
@Component({
  selector: 'app-subscription-state',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, RouterLink, TranslatePipe],
  template: `
    @if (store.error(); as error) {
      <div class="state" role="alert">
        <mat-icon aria-hidden="true">{{ error === noGallery ? 'storefront' : 'error' }}</mat-icon>
        <b>{{ 'subscriptions.errors.' + error | translate }}</b>
        @if (error === noGallery) {
          <a matButton="filled" [routerLink]="store.galleryRegistrationRoute">
            {{ 'subscriptions.status.register_gallery' | translate }}
          </a>
        } @else {
          <button matButton="outlined" type="button" (click)="store.load()">
            <mat-icon aria-hidden="true">refresh</mat-icon>{{ 'common.actions.retry' | translate }}
          </button>
        }
      </div>
    } @else {
      <div class="state" role="status">
        <mat-spinner diameter="32" aria-hidden="true" />
        <span>{{ 'common.states.loading' | translate }}</span>
      </div>
    }
  `,
  styleUrl: '../../styles/subscriptions.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionState {
  protected readonly store = inject(SubscriptionsStore);
  protected readonly noGallery = SubscriptionsErrorCode.GalleryNotRegistered;
}
