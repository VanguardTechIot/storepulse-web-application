import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type KpiTone = 'primary' | 'danger' | 'warning' | 'success' | 'violet';

/**
 * Key indicator of the Consolidated Dashboard: label, value with unit and a short hint.
 * The hint text is projected, so each view decides its wording and tone.
 */
@Component({
  selector: 'app-kpi-card',
  imports: [MatIconModule],
  template: `
    <div class="top">
      <span class="ico" [class]="tone()"
        ><mat-icon aria-hidden="true">{{ icon() }}</mat-icon></span
      >
      {{ label() }}
    </div>
    <div class="value">
      {{ value() }}
      @if (unit()) {
        <small>{{ unit() }}</small>
      }
    </div>
    <div class="hint"><ng-content /></div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 18px 20px;
      background: var(--sp-surface);
      border: 1px solid var(--sp-border);
      border-radius: var(--sp-radius);
      box-shadow: var(--sp-shadow);
    }
    .top {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      font-weight: 500;
      color: var(--sp-text-muted);
    }
    .ico {
      display: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      border-radius: 8px;
    }
    .ico mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .primary {
      background: var(--sp-primary-soft);
      color: var(--sp-primary);
    }
    .danger {
      background: var(--sp-danger-soft);
      color: var(--sp-danger);
    }
    .warning {
      background: var(--sp-warning-soft);
      color: var(--sp-warning);
    }
    .success {
      background: var(--sp-success-soft);
      color: var(--sp-success);
    }
    .violet {
      background: var(--sp-violet-soft);
      color: var(--sp-violet);
    }
    .value {
      font-size: 28px;
      font-weight: 700;
      line-height: 1.1;
    }
    .value small {
      font-size: 14px;
      font-weight: 500;
      color: var(--sp-text-muted);
      margin-left: 4px;
    }
    .hint {
      font-size: 13px;
      color: var(--sp-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiCard {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly unit = input('');
  readonly tone = input<KpiTone>('primary');
}
