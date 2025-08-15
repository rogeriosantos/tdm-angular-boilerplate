import { createFeature, createReducer, on } from '@ngrx/store';
import { UserProfileState, initialUserProfileState } from './user-profile.state';
import * as UserProfileActions from './user-profile.actions';

const userProfileReducer = createReducer(
  initialUserProfileState,
  on(UserProfileActions.loadUserProfile, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UserProfileActions.loadUserProfileSuccess, (state, { userProfile }) => ({
    ...state,
    userProfile,
    loading: false,
    error: null,
  })),
  on(UserProfileActions.loadUserProfileFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);

export const userProfileFeature = createFeature({
  name: 'userProfile',
  reducer: userProfileReducer,
});

export const { selectUserProfileState, selectUserProfile, selectLoading, selectError } =
  userProfileFeature;
