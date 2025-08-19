import { createAction, props } from '@ngrx/store';
import { UserProfile } from '../../../shared/models/user-profile.model';

export const loadUserProfile = createAction('[User Profile] Load User Profile');

export const loadUserProfileSuccess = createAction(
  '[User Profile] Load User Profile Success',
  props<{ userProfile: UserProfile }>()
);

export const loadUserProfileFailure = createAction(
  '[User Profile] Load User Profile Failure',
  props<{ error: any }>()
);
