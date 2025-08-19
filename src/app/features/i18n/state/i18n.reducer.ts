import { createFeature, createReducer, on } from '@ngrx/store';
import { I18nState, initialI18nState } from './i18n.state';
import * as I18nActions from './i18n.actions';

const i18nReducer = createReducer(
  initialI18nState,
  on(I18nActions.setUiLanguage, (state, { language }) => ({
    ...state,
    settings: {
      ...state.settings,
      selectedUiLanguage: language,
    },
  })),
  on(I18nActions.setDataLanguage, (state, { language }) => ({
    ...state,
    settings: {
      ...state.settings,
      selectedDataLanguage: language,
    },
  })),
  on(I18nActions.loadI18nSettingsSuccess, (state, { settings }) => ({
    ...state,
    settings,
    isLoading: false,
  })),
  on(I18nActions.loadI18nSettingsFailure, (state) => ({
    ...state,
    isLoading: false,
  })),
  on(I18nActions.fetchServerLanguageSettings, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(I18nActions.fetchServerLanguageSettingsSuccess, (state, { uiLanguage, dataLanguage }) => ({
    ...state,
    settings: {
      selectedUiLanguage: uiLanguage,
      selectedDataLanguage: dataLanguage,
    },
    isLoading: false,
  })),
  on(I18nActions.fetchServerLanguageSettingsFailure, (state) => ({
    ...state,
    isLoading: false,
  }))
);

export const i18nFeature = createFeature({
  name: 'i18n',
  reducer: i18nReducer,
});

export const { selectI18nState, selectSettings, selectIsLoading } = i18nFeature;
