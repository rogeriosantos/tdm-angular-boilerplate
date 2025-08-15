import { Injectable } from '@angular/core';
import {
  Translation,
  TRANSLOCO_LOADER,
  TranslocoLoader,
  provideTransloco,
} from '@jsverse/transloco';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<Translation> {
    return this.http.get<Translation>(`/assets/i18n/${lang}.json`);
  }
}

export const translocoProviders = provideTransloco({
  config: {
    availableLangs: ['en', 'de'],
    defaultLang: 'en',
    fallbackLang: 'en',
    reRenderOnLangChange: true,
    prodMode: false,
  },
  loader: TranslocoHttpLoader,
});
