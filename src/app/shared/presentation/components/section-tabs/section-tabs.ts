import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';

export interface SectionTab {
  path: string;
  /** Translation key of the tab text. */
  label: string;
  icon: string;
  /** Marks the tab active only on its exact path, for a section root such as a list. */
  exact?: boolean;
}

/** Links between the sections of a module, shown as Material navigation tabs. */
@Component({
  selector: 'app-section-tabs',
  imports: [MatIconModule, MatTabsModule, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './section-tabs.html',
  styleUrl: './section-tabs.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionTabs {
  readonly tabs = input.required<readonly SectionTab[]>();
  /** Translation key of the navigation name read by screen readers. */
  readonly label = input.required<string>();
}
