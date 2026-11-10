import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '../../pipes/translate.pipe';

export type PageStatus = 'loading' | 'error' | 'empty';

/**
 * Loading, error and empty placeholder of a view. Extra actions are projected; the error state
 * offers a retry button unless `retryable` is false.
 */
@Component({
  selector: 'app-page-state',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, TranslatePipe],
  templateUrl: './page-state.html',
  styleUrl: './page-state.css',
  host: { '[attr.role]': "status() === 'error' ? 'alert' : 'status'" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageState {
  readonly status = input<PageStatus>('empty');
  readonly icon = input('info');
  readonly title = input('');
  readonly message = input('');
  readonly retryable = input(true);
  readonly retry = output<void>();

  protected readonly isError = computed(() => this.status() === 'error');
}
