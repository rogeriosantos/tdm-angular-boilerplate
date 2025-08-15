import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { I18nSettings, SupportedLanguage } from '../state/i18n.state';
import { selectSettings } from '../state/i18n.reducer';
import * as I18nActions from '../state/i18n.actions';

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private store = inject(Store);

  get settings$(): Observable<I18nSettings | undefined> {
    return this.store.select(selectSettings);
  }

  setUiLanguage(language: SupportedLanguage): void {
    this.store.dispatch(I18nActions.setUiLanguage({ language }));
  }

  setDataLanguage(language: SupportedLanguage): void {
    this.store.dispatch(I18nActions.setDataLanguage({ language }));
  }

  setBothLanguages(language: SupportedLanguage): void {
    this.setUiLanguage(language);
    this.setDataLanguage(language);
  }

  fetchServerLanguageSettings(): void {
    this.store.dispatch(I18nActions.fetchServerLanguageSettings());
  }
}
