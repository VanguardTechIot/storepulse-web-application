import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { authenticationInterceptor } from './iam/infrastructure/iam.interceptor';
import { TranslationService } from './shared/infrastructure/i18n/translation.service';
import { TranslatedTitleStrategy } from './shared/routing/translated-title.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch(), withInterceptors([authenticationInterceptor])),
    provideAppInitializer(() => inject(TranslationService).load()),
    provideRouter(routes, withComponentInputBinding()),
    { provide: TitleStrategy, useClass: TranslatedTitleStrategy },
    { provide: MAT_ICON_DEFAULT_OPTIONS, useValue: { fontSet: 'material-symbols-outlined' } },
  ],
};
