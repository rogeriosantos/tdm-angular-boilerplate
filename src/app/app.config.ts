import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  importProvidersFrom,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { authInterceptor } from './interceptors/auth.interceptor';
import { i18nInterceptor } from './i18n/interceptors/i18n.interceptor';
import { translocoProviders } from './transloco/transloco-root.module';
import { provideI18n } from './i18n/i18n.provider';
import { I18nEffects } from './i18n/state/i18n.effects';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, i18nInterceptor])),

    // NgRx Store setup
    provideStore(),
    provideEffects([I18nEffects]),
    isDevMode() ? provideStoreDevtools() : [],

    // I18n setup
    provideI18n(),
    translocoProviders,
  ],
};
