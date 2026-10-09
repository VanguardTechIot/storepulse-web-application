import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ICON_PATHS, IconName } from './icon-paths';

/**
 * Renders a style-guide line icon. Paths are static constants, never user input.
 */
@Component({
  selector: 'app-icon',
  template: `<svg
    [attr.width]="size()"
    [attr.height]="size()"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    [attr.stroke-width]="strokeWidth()"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    [innerHTML]="paths()"
  ></svg>`,
  styles: `
    :host { display: inline-flex; flex-shrink: 0; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icon {
  private readonly sanitizer = inject(DomSanitizer);

  readonly name = input.required<IconName>();
  readonly size = input(18);
  readonly strokeWidth = input(1.75);

  protected readonly paths = computed(() => this.sanitizer.bypassSecurityTrustHtml(ICON_PATHS[this.name()]));
}
