import { Component, inject } from '@angular/core';
import { Lang, TranslationService } from '../../../infrastructure/i18n/translation.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.css',
})
export class Toolbar {
  protected readonly i18n = inject(TranslationService);

  protected readonly languages: { code: Lang; label: string }[] = [
    { code: 'en-US', label: 'EN' },
    { code: 'es-419', label: 'ES' },
  ];

  // Datos de ejemplo: después se reemplazarán por el estado real de la galería y el usuario.
  protected readonly gallery = { name: 'Galería Central #04', locales: 92, district: 'Cercado de Lima' };
  protected readonly user = { initials: 'CM', name: 'Carmen Mendoza', role: 'Administradora' };
  protected readonly unreadNotifications = 3;

  protected switchLanguage(code: Lang): void {
    void this.i18n.setLang(code);
  }
}
