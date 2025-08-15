import { Injectable } from '@angular/core';

export interface I18nStorageData {
  selectedUiLanguage: string;
  selectedDataLanguage: string;
}

@Injectable({
  providedIn: 'root',
})
export class I18nStorageService {
  private readonly STORAGE_KEY = 'lastKnownI18nSettings';

  saveI18nSettings(settings: I18nStorageData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save i18n settings to localStorage', error);
    }
  }

  loadI18nSettings(): I18nStorageData | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to load i18n settings from localStorage', error);
      return null;
    }
  }

  getBrowserLanguage(): string {
    // Get browser language and extract the language code (e.g., 'en-US' -> 'en')
    const browserLang = navigator.language || navigator.languages?.[0] || 'en';
    return browserLang.split('-')[0];
  }

  getInitialLanguage(): string {
    const stored = this.loadI18nSettings();
    if (stored?.selectedUiLanguage) {
      return stored.selectedUiLanguage;
    }

    const browserLang = this.getBrowserLanguage();
    // Check if browser language is supported, fallback to 'en'
    return ['en', 'de'].includes(browserLang) ? browserLang : 'en';
  }
}
