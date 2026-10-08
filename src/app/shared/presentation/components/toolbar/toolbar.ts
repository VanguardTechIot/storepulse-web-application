import { Component, inject } from '@angular/core';
import { AuthenticationSection } from '../../../../identity-access-management/presentation/components/authentication-section/authentication-section';
import { TranslationService } from '../../../infrastructure/i18n/translation.service';
import { LanguageSwitcher } from '../language-switcher/language-switcher';

/**
 * Top bar of the authenticated area. The account menu (user and Log Out) comes from
 * Identity and Access Management: the shell is the only shared piece that composes
 * components of a bounded context.
 */
@Component({
  selector: 'app-toolbar',
  imports: [AuthenticationSection, LanguageSwitcher],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.css',
})
export class Toolbar {
  protected readonly i18n = inject(TranslationService);

  // Datos de ejemplo: después se reemplazarán por el estado real de la galería.
  protected readonly gallery = { name: 'Galería Central #04', locales: 92, district: 'Cercado de Lima' };
  protected readonly unreadNotifications = 3;
}
