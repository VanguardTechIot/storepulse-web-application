import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';

interface PropertyTab {
  path: string;
  label: string;
  icon: string;
  exact: boolean;
}

/** Navigation between the sections of Commercial Units. */
@Component({
  selector: 'app-property-tabs',
  imports: [MatIconModule, RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <nav class="tabs" [attr.aria-label]="'property.tabs.label' | translate">
      @for (tab of tabs; track tab.path) {
        <a
          [routerLink]="tab.path"
          routerLinkActive="is-active"
          [routerLinkActiveOptions]="{ exact: tab.exact }"
          #rla="routerLinkActive"
          [attr.aria-current]="rla.isActive ? 'page' : null"
        >
          <mat-icon aria-hidden="true">{{ tab.icon }}</mat-icon>
          {{ tab.label | translate }}
        </a>
      }
    </nav>
  `,
  styles: `
    .tabs {
      display: flex;
      gap: 4px;
      overflow-x: auto;
      overflow-y: hidden;
      box-shadow: inset 0 -1px var(--sp-border);
    }
    a {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 14px;
      border-bottom: 2px solid transparent;
      color: var(--sp-text-muted);
      font-weight: 500;
      text-decoration: none;
      white-space: nowrap;
    }
    a:hover {
      color: var(--sp-text);
    }
    a.is-active {
      color: var(--sp-primary);
      border-bottom-color: var(--sp-primary);
    }
    .mat-icon {
      width: 18px;
      height: 18px;
      font-size: 18px;
    }
  `,
})
export class PropertyTabs {
  protected readonly tabs: PropertyTab[] = [
    { path: '/commercial-units', label: 'property.tabs.units', icon: 'storefront', exact: true },
    {
      path: '/commercial-units/floors',
      label: 'property.tabs.floors',
      icon: 'layers',
      exact: false,
    },
    {
      path: '/commercial-units/invitations',
      label: 'property.tabs.invitations',
      icon: 'forward_to_inbox',
      exact: false,
    },
    {
      path: '/commercial-units/gallery',
      label: 'property.tabs.gallery',
      icon: 'apartment',
      exact: false,
    },
  ];
}
