import { createSelector } from '@ngrx/store';
import { selectUserProfile } from './user-profile.reducer';
import { selectSettings } from '../../i18n/state/i18n.reducer';
import { UserProfileViewModel } from '../../../shared/models/user-profile.model';

export const selectUserProfileViewModel = createSelector(
  selectUserProfile,
  selectSettings,
  (userProfile, i18nSettings): UserProfileViewModel | null => {
    if (!userProfile || !i18nSettings) {
      return null;
    }

    return {
      username: userProfile.username,
      department: userProfile.department || 'Unknown Department',
      uiLanguage: i18nSettings.selectedUiLanguage,
      dataLanguage: i18nSettings.selectedDataLanguage,
      picture: userProfile.picture,
    };
  }
);
