import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Icon } from '../icon/icon';
import { IconName } from '../icon/icon-paths';
import { TranslatePipe } from '../../pipes/translate.pipe';

/**
 * Loading, error and empty placeholders shared by every view.
 */
@Component({
  selector: 'app-view-state',
  imports: [Icon, TranslatePipe],
  template: `
    @switch (state()) {
      @case ('loading') {
        <div class="empty" role="status">
          <span class="spinner spinner-lg" aria-hidden="true"></span>
          <span>{{ title() || ('common.states.loading' | translate) }}</span>
        </div>
      }
      @case ('error') {
        <div class="empty" role="alert">
          <span class="li-ico ico-red"><app-icon name="alert" [size]="26" /></span>
          <b>{{ title() || ('common.states.errorTitle' | translate) }}</b>
          <span>{{ message() || ('common.states.errorMessage' | translate) }}</span>
          <button type="button" class="btn btn-outline btn-sm" (click)="retry.emit()">
            <app-icon name="refresh" [size]="16" />{{ 'common.actions.retry' | translate }}
          </button>
        </div>
      }
      @default {
        <div class="empty">
          <span class="li-ico ico-cyan"><app-icon [name]="icon()" [size]="26" /></span>
          <b>{{ title() }}</b>
          @if (message()) {
            <span>{{ message() }}</span>
          }
          <ng-content />
        </div>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewState {
  readonly state = input<'loading' | 'error' | 'empty'>('empty');
  readonly title = input('');
  readonly message = input('');
  readonly icon = input<IconName>('layers');
  readonly retry = output<void>();
}
