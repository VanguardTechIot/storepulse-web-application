import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Icon } from '../icon/icon';
import { IconName } from '../icon/icon-paths';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ToastService, ToastTone } from './toast.service';

const TONE_ICONS: Record<ToastTone, IconName> = {
  success: 'checkcircle',
  error: 'alert',
  warning: 'alert',
  info: 'bell',
};

@Component({
  selector: 'app-toast-host',
  imports: [Icon, TranslatePipe],
  template: `
    <div class="toast-stack" aria-live="polite" role="status">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [attr.data-tone]="toast.tone">
          <app-icon [name]="icons[toast.tone]" [size]="20" />
          <div class="toast-text">
            <b>{{ toast.title }}</b>
            @if (toast.message) {
              <small>{{ toast.message }}</small>
            }
          </div>
          <button type="button" class="icon-plain" [attr.aria-label]="'common.actions.close' | translate"
                  (click)="toastService.dismiss(toast.id)">
            <app-icon name="x" [size]="16" />
          </button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastHost {
  protected readonly toastService = inject(ToastService);
  protected readonly icons = TONE_ICONS;
}
