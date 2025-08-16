import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TranslocoService } from '@jsverse/transloco';
import { map, tap, withLatestFrom, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { I18nStorageService } from '../services/i18n-storage.service';
import { UserProfileService } from '../../services/user-profile.service';
import { selectSettings } from './i18n.reducer';
import * as I18nActions from './i18n.actions';

@Injectable()
export class I18nEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private i18nStorage = inject(I18nStorageService);
  private transloco = inject(TranslocoService);
  private userProfileService = inject(UserProfileService);

  // Initialize language settings on app start
  initI18n$ = createEffect(() =>
    this.actions$.pipe(
      ofType('@ngrx/effects/init'), // ROOT_EFFECTS_INIT equivalent
      switchMap(() => {
        // Check localStorage first
        const storedSettings = this.i18nStorage.loadI18nSettings();
        if (storedSettings) {
          return of(
            I18nActions.loadI18nSettingsSuccess({
              settings: {
                selectedUiLanguage: storedSettings.selectedUiLanguage,
                selectedDataLanguage: storedSettings.selectedDataLanguage,
              },
            })
          );
        }

        // Try to fetch from server if no localStorage
        return of(I18nActions.fetchServerLanguageSettings());
      })
    )
  );

  // Fetch language settings from server (using user profile locale)
  fetchServerLanguage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(I18nActions.fetchServerLanguageSettings),
      switchMap(() =>
        this.userProfileService.getUserLanguageSettings().pipe(
          map(({ uiLanguage, dataLanguage }) => {
            console.log('🌍 Using user locale for language settings:', { uiLanguage, dataLanguage });
            return I18nActions.fetchServerLanguageSettingsSuccess({ uiLanguage, dataLanguage });
          }),
          catchError((error) => {
            console.warn(
              'Failed to fetch user language settings from profile, using browser fallback:',
              error
            );
            const initialLanguage = this.i18nStorage.getInitialLanguage();
            return of(I18nActions.setUiLanguage({ language: initialLanguage }));
          })
        )
      )
    )
  );

  // Update Transloco when UI language changes
  updateTransloco$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          I18nActions.setUiLanguage,
          I18nActions.loadI18nSettingsSuccess,
          I18nActions.fetchServerLanguageSettingsSuccess
        ),
        tap((action) => {
          let language: string;
          if ('settings' in action) {
            language = action.settings.selectedUiLanguage;
          } else if ('uiLanguage' in action) {
            language = action.uiLanguage;
          } else {
            language = action.language;
          }
          this.transloco.setActiveLang(language);
        })
      ),
    { dispatch: false }
  );

  // Save to localStorage when settings change
  saveSettings$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          I18nActions.setUiLanguage,
          I18nActions.setDataLanguage,
          I18nActions.loadI18nSettingsSuccess,
          I18nActions.fetchServerLanguageSettingsSuccess
        ),
        withLatestFrom(this.store.select(selectSettings)),
        tap(([action, settings]) => {
          if (settings) {
            this.i18nStorage.saveI18nSettings({
              selectedUiLanguage: settings.selectedUiLanguage,
              selectedDataLanguage: settings.selectedDataLanguage,
            });
          }
        })
      ),
    { dispatch: false }
  );
}
