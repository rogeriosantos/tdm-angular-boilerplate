import {
  ApplicationConfig,
  ErrorHandler,
  provideZoneChangeDetection,
  importProvidersFrom,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Core imports
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';

// Feature imports
import { i18nInterceptor } from './i18n/interceptors/i18n.interceptor';
import { I18nEffects } from './i18n/state/i18n.effects';
import { i18nFeature } from './i18n/state/i18n.reducer';
import { UserProfileEffects } from './user-profile/state/user-profile.effects';
import { userProfileFeature } from './user-profile/state/user-profile.reducer';

// Legacy imports (to be refactored)
import { translocoProviders } from './transloco/transloco-root.module';
import { provideI18n } from './i18n/i18n.provider';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([errorInterceptor, authInterceptor, i18nInterceptor])),

    // Material modules
    importProvidersFrom(MatSnackBarModule),

    // NgRx Store setup
    provideStore({
      i18n: i18nFeature.reducer,
      userProfile: userProfileFeature.reducer,
    }),
    provideEffects([I18nEffects, UserProfileEffects]),
    isDevMode()
      ? provideStoreDevtools({
          maxAge: 25,
          logOnly: !isDevMode(),
          autoPause: true,
          trace: false,
          traceLimit: 75,
        })
      : [],

    // I18n and translation setup
    provideI18n(),
    translocoProviders,
  ],
};
