import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { Icon } from '../icon/icon';
import { IconName } from '../icon/icon-paths';
import { TranslatePipe } from '../../pipes/translate.pipe';

/**
 * Modal confirmation used before irreversible or state-changing actions.
 */
@Component({
  selector: 'app-confirm-dialog',
  imports: [Icon, TranslatePipe],
  templateUrl: './confirm-dialog.html',
  host: { '(document:keydown.escape)': 'onEscape()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {
  readonly open = input(false);
  readonly title = input.required<string>();
  readonly message = input('');
  readonly confirmLabel = input.required<string>();
  readonly tone = input<'primary' | 'danger'>('primary');
  readonly icon = input<IconName>('checkcircle');
  readonly busy = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  private readonly confirmButton = viewChild<ElementRef<HTMLButtonElement>>('confirmButton');

  constructor() {
    effect(() => {
      if (this.open()) queueMicrotask(() => this.confirmButton()?.nativeElement.focus());
    });
  }

  protected onEscape(): void {
    if (this.open() && !this.busy()) this.cancelled.emit();
  }
}
