import { UserProfile } from '../../models/user-profile.model';

// Re-export UserProfile for other components
export type { UserProfile } from '../../models/user-profile.model';

export interface UserProfileState {
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export const initialUserProfileState: UserProfileState = {
  userProfile: null,
  loading: false,
  error: null,
};
