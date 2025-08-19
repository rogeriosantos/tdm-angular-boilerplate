import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { UserProfileService } from '../../../core/services/user-profile.service';
import * as UserProfileActions from './user-profile.actions';
import * as I18nActions from '../../i18n/state/i18n.actions';

@Injectable()
export class UserProfileEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private userProfileService = inject(UserProfileService);

  // Load user profile
  loadUserProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserProfileActions.loadUserProfile),
      switchMap(() =>
        this.userProfileService.getUserInfo().pipe(
          map((userProfile) => UserProfileActions.loadUserProfileSuccess({ userProfile })),
          catchError((error) => of(UserProfileActions.loadUserProfileFailure({ error })))
        )
      )
    )
  );

  // Update language preferences when user profile loads (like WebClients)
  updateLanguageFromProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserProfileActions.loadUserProfileSuccess),
      map(({ userProfile }) => {
        const uiLanguage = this.convertToSupportedLanguage(userProfile.locale || 'en-US');
        const dataLanguage = this.convertToSupportedLanguage(userProfile.data_language || 'en-US');

        return I18nActions.fetchServerLanguageSettingsSuccess({
          uiLanguage,
          dataLanguage,
        });
      })
    )
  );

  private convertToSupportedLanguage(language: string): string {
    if (language.startsWith('en')) return 'en';
    if (language.startsWith('de')) return 'de';
    return 'en';
  }
}
