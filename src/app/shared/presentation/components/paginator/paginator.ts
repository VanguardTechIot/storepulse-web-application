import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { Icon } from '../icon/icon';
import { TranslatePipe } from '../../pipes/translate.pipe';

/**
 * Table footer with the visible range and page navigation.
 */
@Component({
  selector: 'app-paginator',
  imports: [Icon, TranslatePipe],
  template: `
    <div class="pager">
      <span>{{ 'common.pagination.range' | translate: { from: from(), to: to(), total: total() } }}</span>
      @if (pageCount() > 1) {
        <nav class="pages" [attr.aria-label]="'common.pagination.label' | translate">
          <button type="button" [disabled]="page() === 1" (click)="page.set(page() - 1)"
                  [attr.aria-label]="'common.pagination.previous' | translate">
            <app-icon name="arrowleft" [size]="14" />
          </button>
          @for (p of pages(); track p) {
            <button type="button" [class.on]="p === page()" [attr.aria-current]="p === page() ? 'page' : null"
                    (click)="page.set(p)">{{ p }}</button>
          }
          <button type="button" [disabled]="page() === pageCount()" (click)="page.set(page() + 1)"
                  [attr.aria-label]="'common.pagination.next' | translate">
            <app-icon name="arrowright" [size]="14" />
          </button>
        </nav>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Paginator {
  readonly total = input.required<number>();
  readonly pageSize = input(10);
  readonly page = model(1);

  protected readonly pageCount = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  protected readonly pages = computed(() => Array.from({ length: this.pageCount() }, (_, i) => i + 1));
  protected readonly from = computed(() => (this.total() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1));
  protected readonly to = computed(() => Math.min(this.total(), this.page() * this.pageSize()));
}

/** Returns the items of the given 1-based page. */
export function paginate<T>(items: readonly T[], page: number, pageSize: number): T[] {
  return items.slice((page - 1) * pageSize, page * pageSize);
}
