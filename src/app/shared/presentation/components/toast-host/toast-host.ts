import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ToastService, ToastTone } from './toast.service';

const TONE_ICONS: Record<ToastTone, string> = {
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'notifications',
};

/** Stack of the toasts shown by `ToastService`. */
@Component({
  selector: 'app-toast-host',
  imports: [MatIconModule, TranslatePipe],
  templateUrl: './toast-host.html',
  styleUrl: './toast-host.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastHost {
  protected readonly toastService = inject(ToastService);
  protected readonly icons = TONE_ICONS;
}
