import { createAction, props } from '@ngrx/store';
import { I18nSettings } from './i18n.state';

export const setUiLanguage = createAction('[I18n] Set UI Language', props<{ language: string }>());

export const setDataLanguage = createAction(
  '[I18n] Set Data Language',
  props<{ language: string }>()
);

export const loadI18nSettingsSuccess = createAction(
  '[I18n] Load I18n Settings Success',
  props<{ settings: I18nSettings }>()
);

export const loadI18nSettingsFailure = createAction(
  '[I18n] Load I18n Settings Failure',
  props<{ error: any }>()
);

export const fetchServerLanguageSettings = createAction('[I18n] Fetch Server Language Settings');

export const fetchServerLanguageSettingsSuccess = createAction(
  '[I18n] Fetch Server Language Settings Success',
  props<{ uiLanguage: string; dataLanguage: string }>()
);

export const fetchServerLanguageSettingsFailure = createAction(
  '[I18n] Fetch Server Language Settings Failure',
  props<{ error: any }>()
);
