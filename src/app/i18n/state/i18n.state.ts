export interface I18nSettings {
  selectedUiLanguage: string;
  selectedDataLanguage: string;
}

export interface I18nState {
  settings: I18nSettings;
  isLoading: boolean;
}

export const initialI18nState: I18nState = {
  settings: {
    selectedUiLanguage: 'en',
    selectedDataLanguage: 'en',
  },
  isLoading: false,
};

export const supportedLanguages = ['en', 'de'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];
