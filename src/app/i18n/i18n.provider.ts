import { makeEnvironmentProviders } from '@angular/core';
import { provideEffects } from '@ngrx/effects';
import { provideState, provideStore } from '@ngrx/store';

import { I18nEffects } from './state/i18n.effects';
import { i18nFeature } from './state/i18n.reducer';

/**
 * Provides the I18n setup with NgRx state management
 * Similar to WebClients provideI18n function
 * @param setupStore if the app doesn't already use the store needs to be set to true
 * @returns the store setup for the i18n functionality
 */
export function provideI18n(setupStore = false) {
  return makeEnvironmentProviders([
    ...(setupStore ? [provideStore(), provideEffects([I18nEffects])] : []),
    provideState(i18nFeature),
  ]);
}
