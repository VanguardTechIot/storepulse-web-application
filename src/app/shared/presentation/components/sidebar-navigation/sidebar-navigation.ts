import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslationService } from '../../../infrastructure/i18n/translation.service';

interface NavItem {
  key: string;
  labelKey: string;
  route: string;
  icon: string;
  dot?: boolean;
}

@Component({
  selector: 'app-sidebar-navigation',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar-navigation.html',
  styleUrl: './sidebar-navigation.css',
})
export class SidebarNavigation {
  protected readonly i18n = inject(TranslationService);

  protected readonly items: NavItem[] = [
    { key: 'dashboard', labelKey: 'nav.dashboard', route: '/dashboard', icon: 'M4 4h7v9H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 15h7v5H4z', dot: true },
    { key: 'commercial-units', labelKey: 'nav.commercial_units', route: '/commercial-units', icon: 'M4 9l1-5h14l1 5M4 9h16v11H4zM9 20v-6h6v6' },
    { key: 'devices', labelKey: 'nav.devices', route: '/devices', icon: 'M7 7h10v10H7zM9 9h6v6H9zM4 9h3M4 15h3M17 9h3M17 15h3M9 4v3M15 4v3M9 17v3M15 17v3' },
    { key: 'utility-meters', labelKey: 'nav.utility_meters', route: '/utility-meters', icon: 'M4 14a8 8 0 1 1 16 0M12 14l4-4' },
    { key: 'billing', labelKey: 'nav.billing', route: '/billing', icon: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6' },
    { key: 'security', labelKey: 'nav.security', route: '/security', icon: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z', dot: true },
    { key: 'monitoring', labelKey: 'nav.monitoring', route: '/monitoring', icon: 'M3 12h4l2-5 4 10 2-5h6' },
    { key: 'communication', labelKey: 'nav.communication', route: '/communication', icon: 'M4 5h16v11H9l-5 4z' },
    { key: 'subscription', labelKey: 'nav.subscription', route: '/subscription', icon: 'M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z' },
  ];
}
