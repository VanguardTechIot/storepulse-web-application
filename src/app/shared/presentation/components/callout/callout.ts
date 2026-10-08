import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export type CalloutType = 'info' | 'ok' | 'warn' | 'danger';

/**
 * Contextual message (info, success, warning or error) built on an outlined Material card.
 * Set `role="alert"` or `role="status"` on the host when the message appears dynamically.
 */
@Component({
  selector: 'app-callout',
  imports: [MatCardModule, MatIconModule],
  templateUrl: './callout.html',
  styleUrl: './callout.css',
})
export class Callout {
  readonly type = input<CalloutType>('info');
  readonly icon = input.required<string>();
}
