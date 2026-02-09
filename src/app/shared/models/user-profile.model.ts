export interface UserProfile {
  username: string;
  claimsName?: string;
  department?: string;
  email?: string;
  picture?: string;
  locale?: string;
  data_language?: string;
}

export interface UserProfileViewModel {
  username: string;
  department: string;
  uiLanguage: string;
  dataLanguage: string;
  picture?: string;
}
